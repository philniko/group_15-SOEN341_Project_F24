import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import UserModel from "./models/User.js";
import GroupModel from "./models/Group.js";
import RatingModel from "./models/Ratings.js";
import MessageModel from "./models/Message.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";

const JWT_SECRET = "secret";
const io = new Server(3002, {
  cors: {
    origin: ["http://localhost:5173"]
  },
});
// server/index.js

// Middleware to verify JWT
const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).json("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json("Invalid token");
  }
};

const app = express();
app.use(express.json());
app.use(cors());

//for testing
// if (process.env.NODE_ENV !== "test") {
//   mongoose.connect("mongodb://localhost:27017/appDB");
//   app.listen(3001, () => {
//     console.log("Server is running on port 3001");
//   });
// }


// export default {app, io};

//connect mongodb
mongoose.connect("mongodb://localhost:27017/appDB");

//chat system
function addMessageToDatabase(user, name, groupID, message) {
  GroupModel.findById(groupID)
    .then((group) => {
      if (!group.messages) {
        group.messages = [];
      }

      group.messages.push({ sender: user, name: name, message: message });
      group.save();
    })
    .catch((err) => {
      console.log(err);
    });
}

io.on("connection", (socket) => {
  socket.on("join-room", (room) => {
    socket.join(room);
  });
  socket.on("leave-room", (room) => {
    socket.leave(room);
  });
  socket.on("sendMessage", (user, name, room, message) => {
    addMessageToDatabase(user, name, room, message);
    socket.to(room).emit("receiveMessage", user, name, message);
  });

  // Join a specific user's private room for direct messages
  socket.on("join-user", (userId) => {
    socket.join(userId); // Join a room named after the user's ID
  });

  socket.on("sendPrivateMessage", (data) => {
    const { sender, recipient, message } = data;

    // Save the message to the database
    const newMessage = new MessageModel({ sender, recipient, message });
    newMessage
      .save()
      .catch((err) => console.error("Error saving message:", err));

    // Emit the message to the recipient's room
    io.to(recipient).emit("receivePrivateMessage", {
      sender,
      message,
      timestamp: new Date(),
    });
  });
});

app.get("/getContacts", verifyJWT, async (req, res) => {
  const userId = req.user.id;

  try {
    // Find groups where the user is a member
    const groups = await GroupModel.find({ students: userId }).populate(
      "students",
      "firstName lastName email"
    );

    // Collect all unique contacts from those groups
    const contacts = new Set();
    groups.forEach((group) => {
      group.students.forEach((student) => {
        if (student._id.toString() !== userId) {
          contacts.add(student);
        }
      });
    });

    res.status(200).json({ contacts: Array.from(contacts) });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/sendPrivateMessage", verifyJWT, async (req, res) => {
  const sender = req.user.id; // Authenticated user's ID
  const { recipient, message } = req.body; // Recipient ID and message text

  try {
    // Validate input
    if (!recipient || !message) {
      return res
        .status(400)
        .json({ message: "Recipient and message are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(recipient)) {
      return res.status(400).json({ message: "Invalid recipient ID" });
    }

    // Save the message to the database
    const newMessage = new MessageModel({
      sender,
      recipient,
      message,
    });

    await newMessage.save();

    // Emit the message to the recipient's private room via Socket.IO
    io.to(recipient).emit("receivePrivateMessage", {
      sender,
      message,
      timestamp: new Date(),
    });

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending private message:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/getPrivateMessages", verifyJWT, async (req, res) => {
  const userId = req.user.id; // Authenticated user's ID
  const { contactId } = req.body; // Contact ID

  console.log("Fetching messages for:", { userId, contactId });

  try {
    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(contactId)
    ) {
      return res.status(400).json({ message: "Invalid user or contact ID" });
    }

    // Fetch messages between the user and the contact
    const messages = await MessageModel.find({
      $or: [
        { sender: userId, recipient: contactId },
        { sender: contactId, recipient: userId },
      ],
    }).sort({ timestamp: 1 });

    console.log("Fetched messages:", messages);

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching private messages:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/getMessages", verifyJWT, (req, res) => {
  const teamId = req.body.groupId;
  GroupModel.findById(teamId)
    .then((team) => {
      if (team.messages == null) {
        res.status(200).json([]);
      } else {
        res.status(200).json(team.messages);
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json("Invalid Team");
    });
});

// Handling register request
app.post("/register", async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  // Check if all fields are filled
  if (!firstName) {
    return res
      .status(400)
      .json({ type: "firstName", message: "Please enter your first name!" });
  }
  if (!lastName) {
    return res
      .status(400)
      .json({ type: "lastName", message: "Please enter your last name!" });
  }
  if (!email) {
    return res
      .status(400)
      .json({ type: "email", message: "Please enter your email!" });
  }
  if (!password) {
    return res
      .status(400)
      .json({ type: "password", message: "Please enter your password!" });
  }
  if (!role) {
    return res
      .status(400)
      .json({ type: "role", message: "Please choose your role!" });
  }

  try {
    // Check if the user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ type: "email", message: "The email has already been taken!" });
    }

    // Create and save the new user
    const newUser = new UserModel({
      firstName,
      lastName,
      email,
      password, // This will be hashed automatically by the UserModel's pre-save middleware
      role,
      groups: [],
    });

    const savedUser = await newUser.save();
    res
      .status(201)
      .json({ message: "User registered successfully", user: savedUser });
  } catch (error) {
    console.error("Error during registration:", error);
    res
      .status(500)
      .json({ type: "server", message: "Server Registration Error" });
  }
});

// Handling login request
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ type: "general", message: "Incorrect email or password!" });
    }

    // Compare hashed password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res
        .status(401)
        .json({ type: "general", message: "Incorrect email or password!" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ role: user.role, token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//handling getGroups request
app.post("/getGroups", verifyJWT, (req, res) => {
  const userId = req.user.id; // Extract user ID from JWT

  UserModel.findById(userId)
    .populate({
      path: "groups",
      populate: {
        path: "instructor", // Populate the instructor details within the group
        select: "firstName lastName", // Select the necessary fields from the instructor
      },
    })
    .then((user) => {
      if (!user) {
        return res
          .status(400)
          .json({ type: "error", message: "User not found" });
      }
      return res.status(200).json({ groups: user.groups });
    })
    .catch(() =>
      res.status(500).json({ type: "error", message: "Server error" })
    );
});

app.post("/getGroup", verifyJWT, async (req, res) => {
  const userId = req.user.id; // Extract user ID from JWT
  const { id } = req.body; // Group ID

  try {
    // Fetch the group and populate students and ratings
    const group = await GroupModel.findById(id)
      .populate("students")
      .populate({
        path: "ratings",
        populate: { path: "ratee rater", select: "_id" }, // Populate ratee and rater IDs
      });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Create a map to hold the ratings received by each student
    const studentRatingsMap = {};

    // Initialize the map with empty arrays for each student
    group.students.forEach((student) => {
      studentRatingsMap[student._id] = [];
    });

    // Fill the map with ratings
    group.ratings.forEach((rating) => {
      // Ensure the ratee is in the map (in case of data inconsistency)
      if (studentRatingsMap[rating.ratee._id]) {
        studentRatingsMap[rating.ratee._id].push(rating);
      }
    });

    // Add 'rated' and 'overallGrade' properties to each student
    const studentsWithGrades = group.students.map((student) => {
      // Calculate the overall grade for the student
      const ratingsReceived = studentRatingsMap[student._id];
      let overallGrade = null;

      if (ratingsReceived && ratingsReceived.length > 0) {
        const totalGrades = ratingsReceived.reduce(
          (acc, rating) => {
            acc.Cooperation += rating.CooperationRating;
            acc.ConceptualContribution += rating.ConceptualContributionRating;
            acc.PracticalContribution += rating.PracticalContributionRating;
            acc.WorkEthic += rating.WorkEthicRating;
            return acc;
          },
          {
            Cooperation: 0,
            ConceptualContribution: 0,
            PracticalContribution: 0,
            WorkEthic: 0,
          }
        );

        const numberOfRatings = ratingsReceived.length;
        const avgCooperation = totalGrades.Cooperation / numberOfRatings;
        const avgConceptual =
          totalGrades.ConceptualContribution / numberOfRatings;
        const avgPractical =
          totalGrades.PracticalContribution / numberOfRatings;
        const avgWorkEthic = totalGrades.WorkEthic / numberOfRatings;

        overallGrade =
          (avgCooperation + avgConceptual + avgPractical + avgWorkEthic) / 4;
      }

      return {
        ...student.toObject(),
        rated: group.ratings.some(
          (rating) =>
            rating.rater._id.toString() === userId &&
            rating.ratee._id.toString() === student._id.toString()
        ),
        overallGrade:
          overallGrade !== null ? overallGrade.toFixed(2) : "No Ratings",
      };
    });

    res.status(200).json({
      group: {
        ...group.toObject(),
        students: studentsWithGrades,
      },
    });
  } catch (err) {
    console.error("Error in /getGroup:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/getStudentGroup", verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from JWT
    const user = await UserModel.findById(userId).populate("groups"); // Fetch user with populated groups

    if (!user || !user.groups || user.groups.length === 0) {
      return res
        .status(400)
        .json({ error: "User does not belong to any group" });
    }

    const groupId = user.groups[0]._id; // Assuming user belongs to one group
    const group = await GroupModel.findById(groupId).populate("students"); // Fetch group with populated students

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.status(200).json({ group });
  } catch (err) {
    console.error("Error in /getStudentGroup:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/createGroup", verifyJWT, async (req, res) => {
  const userId = req.user.id; // Extract user ID from JWT
  const name = req.body.name;

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "Instructor does not exist" });
    }

    if (user.role.toLowerCase() !== "instructor") {
      return res.status(403).json({ message: "User is not an instructor" });
    }

    // Check if group name already exists for this instructor
    const existingGroup = await GroupModel.findOne({
      name: name,
      instructor: userId,
    });
    if (existingGroup) {
      return res.status(400).json({ message: "Group name already exists" });
    }

    // Creating group
    const group = new GroupModel({
      name: name,
      instructor: user,
      students: [],
      ratings: [],
    });

    const savedGroup = await group.save();

    // Updating instructor's groups array
    user.groups.push(savedGroup._id);
    await user.save();

    res.status(200).json(savedGroup);
  } catch (err) {
    console.error("Error creating group:", err);
    res
      .status(500)
      .json({ message: "Error creating group", error: err.message });
  }
});

// handling group removal
app.post("/removeGroup", verifyJWT, async (req, res) => {
  const userId = req.user.id; // Extract user ID from JWT
  const { groupId } = req.body; // Extract group ID from the request body

  try {
    // Find the group by its ID
    const group = await GroupModel.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Ensure that the requesting user is the instructor of the group
    if (group.instructor.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Only the instructor can delete this group" });
    }

    // Remove the group reference from all students in the group's `students` array
    await UserModel.updateMany(
      { _id: { $in: group.students } }, // Find all users in this group
      { $pull: { groups: groupId } } // Remove the group reference
    );

    // Optional: Remove all associated ratings for this group
    await RatingModel.deleteMany({ _id: { $in: group.ratings } });

    // Manually delete the group document
    await GroupModel.deleteOne({ _id: groupId });

    res.status(200).json({ message: "Group successfully removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
//handling student addition
app.post("/addStudent", (req, res) => {
  //request format: {groupId: String, userEmail: String}

  const { groupId, userEmail } = req.body;

  if (!groupId) {
    res.status(400).json({ type: "error", message: "Missing group id!" });
  } else if (!userEmail) {
    res.status(400).json({ type: "error", message: "Missing student email!" });
  } else {
    UserModel.findOne({ email: userEmail })
      .then((user) => {
        if (!user) {
          res
            .status(400)
            .json({ type: "error", message: "User does not exit!" });
        } else if (user.role != "student") {
          res
            .status(400)
            .json({ type: "error", message: "User is not a student!" });
        } else {
          GroupModel.findById(groupId)
            .then((group) => {
              if (!group) {
                res
                  .status(400)
                  .json({ type: "error", message: "Group does not exist!" });
              } else {
                let valid = true;

                for (let i = 0; i < user.groups.length; i++) {
                  if (user.groups[i]._id.equals(group._id)) {
                    valid = false;
                    break;
                  }
                }

                if (!valid) {
                  res.status(400).json({
                    type: "error",
                    message: "User is already a member of the group!",
                  });
                } else {
                  //updating student groups and group students arrays
                  user.groups.push(group);
                  group.students.push(user);

                  user.save();
                  group.save();

                  res.status(200).json(group);
                }
              }
            })
            .catch((err) => res.status(500).json(err));
        }
      })
      .catch((err) => res.status(500).json(err));
  }
});

// handling group name change
app.post("/changeGroupName", verifyJWT, async (req, res) => {
  const userId = req.user.id; // Extract user ID from JWT
  const { groupId, newName } = req.body; // Extract group ID and the new name from the request body

  try {
    // Check if the group exists
    const group = await GroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if the user is the instructor of the group
    if (group.instructor.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Only the instructor can change the group name" });
    }

    // Update the group name
    group.name = newName;
    await group.save();

    res.status(200).json({ message: "Group name updated successfully", group });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// handling student removal from group
app.post("/removeStudent", verifyJWT, async (req, res) => {
  const { groupId, studentId } = req.body;

  try {
    // Find the group by ID
    const group = await GroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Find the student by ID and ensure they exist
    const student = await UserModel.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if the student is part of the group
    if (!group.students.includes(studentId)) {
      return res
        .status(400)
        .json({ message: "Student is not a member of this group" });
    }

    // Remove the student from the group's students array
    group.students = group.students.filter((id) => id.toString() !== studentId);
    await group.save();

    // Remove the group from the student's groups array
    student.groups = student.groups.filter((id) => id.toString() !== groupId);
    await student.save();

    res
      .status(200)
      .json({ message: "Student removed from group successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/saveRating", verifyJWT, async (req, res) => {
  const {
    rateeId,
    Cooperation,
    ConceptualContribution,
    PracticalContribution,
    WorkEthic,
    CooperationFeedback,
    ConceptualContributionFeedback,
    PracticalContributionFeedback,
    WorkEthicFeedback,
  } = req.body;

  const userId = req.user.id;
  const groupId = req.body.groupId;

  try {
    // Check if the group exists
    const group = await GroupModel.findById(groupId).populate("ratings");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const raterObjectID = new mongoose.Types.ObjectId(userId);
    const rateeObjectID = new mongoose.Types.ObjectId(rateeId);

    // Check if the rating already exists
    let existingRating = await RatingModel.findOne({
      rater: raterObjectID,
      ratee: rateeObjectID,
      group: groupId,
    });

    if (existingRating) {
      // Update existing rating
      existingRating.CooperationRating = Cooperation;
      existingRating.CooperationFeedback = CooperationFeedback;
      existingRating.ConceptualContributionRating = ConceptualContribution;
      existingRating.ConceptualContributionFeedback =
        ConceptualContributionFeedback;
      existingRating.PracticalContributionRating = PracticalContribution;
      existingRating.PracticalContributionFeedback =
        PracticalContributionFeedback;
      existingRating.WorkEthicRating = WorkEthic;
      existingRating.WorkEthicFeedback = WorkEthicFeedback;

      await existingRating.save();
    } else {
      // Create a new rating
      const newRating = new RatingModel({
        rater: raterObjectID,
        ratee: rateeObjectID,
        group: groupId,
        CooperationRating: Cooperation,
        CooperationFeedback: CooperationFeedback,
        ConceptualContributionRating: ConceptualContribution,
        ConceptualContributionFeedback: ConceptualContributionFeedback,
        PracticalContributionRating: PracticalContribution,
        PracticalContributionFeedback: PracticalContributionFeedback,
        WorkEthicRating: WorkEthic,
        WorkEthicFeedback: WorkEthicFeedback,
      });

      await newRating.save();

      // Add the rating to the group's ratings array
      group.ratings.push(newRating._id);
      await group.save();
    }

    res.status(200).json({ message: "Successful save" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/getRating", verifyJWT, async (req, res) => {
  const userId = req.user.id; // Rater ID (current user)
  const { groupId, rateeId } = req.body;

  try {
    const rating = await RatingModel.findOne({
      rater: userId,
      ratee: rateeId,
      group: groupId,
    });

    if (rating) {
      res.status(200).json({ rating });
    } else {
      res.status(200).json({ rating: null });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/getSummaryView", verifyJWT, async (req, res) => {
  try {
    const instructorId = req.user.id; // Get the instructor's ID from the token

    const groups = await GroupModel.find({ instructor: instructorId })
      .populate({
        path: "students",
        select: "email firstName lastName", // Get basic student info
      })
      .populate({
        path: "ratings",
        populate: { path: "ratee", select: "_id" }, // Populate ratee for rating calculations
      });

    const studentSummaries = groups.flatMap((group) => {
      return group.students.map((student) => {
        // ... (rest of your existing code)
        // Filter ratings where this student is the ratee
        const studentRatings = group.ratings.filter((rating) =>
          rating.ratee.equals(student._id)
        );

        // Calculate averages and peer count
        const avgCooperation = studentRatings.length
          ? studentRatings.reduce((acc, r) => acc + r.CooperationRating, 0) /
            studentRatings.length
          : 0;
        const avgConceptualContribution = studentRatings.length
          ? studentRatings.reduce(
              (acc, r) => acc + r.ConceptualContributionRating,
              0
            ) / studentRatings.length
          : 0;
        const avgPracticalContribution = studentRatings.length
          ? studentRatings.reduce(
              (acc, r) => acc + r.PracticalContributionRating,
              0
            ) / studentRatings.length
          : 0;
        const avgWorkEthic = studentRatings.length
          ? studentRatings.reduce((acc, r) => acc + r.WorkEthicRating, 0) /
            studentRatings.length
          : 0;
        const overallAverage =
          (avgCooperation +
            avgConceptualContribution +
            avgPracticalContribution +
            avgWorkEthic) /
          4;
        const peersResponded = studentRatings.length;

        return {
          email: student.email,
          firstName: student.firstName,
          lastName: student.lastName,
          team: group.name,
          teamId: group._id,
          avgCooperation: avgCooperation,
          avgConceptualContribution: avgConceptualContribution,
          avgPracticalContribution: avgPracticalContribution,
          avgWorkEthic: avgWorkEthic,
          overallAverage: overallAverage,
          peersResponded: peersResponded,
        };
      });
    });

    res.status(200).json(studentSummaries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching student ratings summary" });
  }
});

app.post("/getGrade", verifyJWT, (req, res) => {
  const userId = req.user.id;
  const groupId = req.body.groupId;

  GroupModel.findById(groupId)
    .populate({ path: "ratings" })
    .then((group) => {
      let numberOfRatings = 0;
      let cooperationTotal = 0;
      let conceptualTotal = 0;
      let practicalTotal = 0;
      let workEthicTotal = 0;

      for (let i = 0; i < group.ratings.length; i++) {
        if (group.ratings[i].ratee._id.equals(userId)) {
          numberOfRatings += 1;
          cooperationTotal += group.ratings[i].CooperationRating;
          conceptualTotal += group.ratings[i].ConceptualContributionRating;
          practicalTotal += group.ratings[i].PracticalContributionRating;
          workEthicTotal += group.ratings[i].WorkEthicRating;
        }
      }

      if (numberOfRatings == 0) {
        res.status(300).json({
          message: "No ratings",
        });
      } else {
        res.status(200).json({
          totalGrade:
            (cooperationTotal +
              conceptualTotal +
              practicalTotal +
              workEthicTotal) /
            (4 * numberOfRatings),
          cooperationGrade: cooperationTotal / numberOfRatings,
          conceptualGrade: conceptualTotal / numberOfRatings,
          practicalGrade: practicalTotal / numberOfRatings,
          workEthicGrade: workEthicTotal / numberOfRatings,
        });
      }
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

app.post("/getStudentRatings", verifyJWT, async (req, res) => {
  const { groupId, studentId } = req.body;

  try {
    // Find the group to ensure it exists
    const group = await GroupModel.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Find all ratings for the student in the specified group
    const ratings = await RatingModel.find({
      ratee: studentId,
      group: groupId,
    }).populate("rater", "firstName lastName email");

    // If no ratings are found
    if (!ratings || ratings.length === 0) {
      return res.status(200).json({ ratings: [] });
    }

    res.status(200).json({ ratings });
  } catch (error) {
    console.error("Error fetching student ratings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/setCourse", verifyJWT, async (req, res) => {
  const userId = req.user.id; // Instructor's ID from JWT
  const { groupId, courseId } = req.body; // Group ID and Course ID from the request

  try {
      const group = await GroupModel.findById(groupId);

      if (!group) {
          return res.status(404).json({ message: "Group not found" });
      }

      if (group.instructor.toString() !== userId) {
          return res
              .status(403)
              .json({ message: "Only the instructor can update the course" });
      }

      group.course = courseId; // Overwrites the existing course
      await group.save();

      res.status(200).json({ message: "Course added successfully", group });
  } catch (error) {
      console.error("Error in /setCourse:", error);
      res.status(500).json({ message: "Server error" });
  }
});

app.post("/getCourse", verifyJWT, async (req, res) => {
  const { groupId } = req.body; // Group ID from the request

  try {
    // Find the group by ID and populate the course details if it references another model
    const group = await GroupModel.findById(groupId).populate("course");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json({ course: group.course });
  } catch (error) {
    console.error("Error in /getCourse:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
