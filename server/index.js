import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import UserModel from "./models/User.js";
import GroupModel from "./models/Group.js";
import RatingModel from "./models/Ratings.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = "secret";
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

//connect mongodb
mongoose.connect("mongodb://localhost:27017/appDB");

//handling register request
app.post("/register", (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  //making sure all fields are filled
  if (!firstName) {
    return res.status(400).json({ type: "firstName", message: "Please enter your first name!" });
  }
  if (!lastName) {
    return res.status(400).json({ type: "lastName", message: "Please enter your last name!" });
  }
  if (!email) {
    return res.status(400).json({ type: "email", message: "Please enter your email!" });
  }
  if (!password) {
    return res.status(400).json({ type: "password", message: "Please enter your password!" });
  }
  if (!role) {
    return res.status(400).json({ type: "role", message: "Please choose your role!" });
  }

  //checking to see if the user already exists
  try {
    const existingUser = UserModel.findOne({
      email: email
    }).then((user) => {
      if (user) {
        return res.status(409).json({ type: "email", message: "The email has already been taken!" });
      } else {
        //create new user, password is hashed in UserSchema.js
        const newUser = new UserModel({
          firstName,
          lastName,
          email,
          password,
          role,
          groups: [],
        });

        const savedUser = newUser.save();
        res.status(201).json(savedUser);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ type: "server", message: "Server Registration Error" });
  }
});

//handling login request
app.post("/login", (req, res) => {
  UserModel.findOne({ email: req.body.email }).then((user) => {
    if (!user) {
      res.status(404).json({ type: "general", message: "Incorrect email or password!" });
    } else {
      const validPassword = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (validPassword) {
        //generate token
        const token = jwt.sign({ id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }, JWT_SECRET, {
          expiresIn: "1h",
        });
        res.status(200).json({ role: user.role, token: token });
      } else {
        res.status(401).json({ type: "general", message: "Incorrect email or password!" });
      }
    }
  });
});

//handling getGroups request
app.post("/getGroups", verifyJWT, (req, res) => {
  const userId = req.user.id; // Extract user ID from JWT

  UserModel.findById(userId)
    .populate({
      path: 'groups',
      populate: {
        path: 'instructor', // Populate the instructor details within the group
        select: 'firstName lastName'  // Select the necessary fields from the instructor
      }
    })
    .then((user) => {
      if (!user) {
        return res.status(400).json({ type: "error", message: "User not found" });
      }
      return res.status(200).json({ groups: user.groups });
    })
    .catch(() => res.status(500).json({ type: "error", message: "Server error" }));
});


app.post("/getGroup", verifyJWT, async (req, res) => {
  const userId = req.user.id; // Extract user ID from JWT
  const { id } = req.body; // Group ID

  try {
    // Fetch the group and populate students and ratings given by the current user
    const group = await GroupModel.findById(id)
      .populate("students")
      .populate({
        path: "ratings",
        match: { rater: userId }, // Only ratings given by the current user
        select: "ratee", // Only select the ratee field
      });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Create a set of rateeIds that the current user has rated
    const ratedStudentIds = new Set(group.ratings.map((rating) => rating.ratee.toString()));

    // Add 'rated' property to each student
    const studentsWithRatedStatus = group.students.map((student) => ({
      ...student.toObject(),
      rated: ratedStudentIds.has(student._id.toString()),
    }));

    res.status(200).json({
      group: {
        ...group.toObject(),
        students: studentsWithRatedStatus,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/getStudentGroup", verifyJWT, (req, res) => { //request format: {id: String} (team id)
  let { user } = req.user;
  if (!user.groups || user.groups.length === 0) {
    return res.status(400).json({ error: "User does not belong to any group" });
  }

  const groupId = user.groups[0]; // Assuming user belongs to one group, use the first group ID

  GroupModel.findById(groupId)
    .populate("students") // populating students in the group
    .then((group) => {
      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }
      return res.status(200).json({ group });
    })
    .catch((err) => res.status(500).json({ error: err.message }));
});

//handling group creation
app.post("/createGroup", verifyJWT, (req, res) => { //request format: {id: String, name: String} (instructor ID and team name)
  const userId = req.user.id; // Extract user ID from JWT
  const name = req.body.name;
  UserModel.findById(userId)
    .then((user) => {
      if (!user) {
        res.status(400).json("Instructor does not exist");
      }
      else if (user.role != "instructor") {
        res.status(400).json("User is not an instructor");
      }
      else {
        //creating group
        const group = {
          name: name,
          instructor: user,
          students: [],
          ratings: []
        };

        GroupModel.create(group)
          .then((group) => {
            //updating instructor's groups array
            user.groups.push(group);
            user.save();
            res.status(200).json(group);
          })
          .catch((err) => res.status(500).json(err));
      }
    })
    .catch((err) => res.status(500).json(err));
});

//handling student addition
app.post("/addStudent", (req, res) => { //request format: {groupId: String, userEmail: String}

  const { groupId, userEmail } = req.body;

  if (!groupId) {
    res.status(400).json({ type: "error", message: "Missing group id!" });
  }
  else if (!userEmail) {
    res.status(400).json({ type: "error", message: "Missing student email!" });
  }
  else {
    UserModel.findOne({ email: userEmail })
      .then((user) => {
        if (!user) {
          res.status(400).json({ type: "error", message: "User does not exit!" });
        }
        else if (user.role != "student") {
          res.status(400).json({ type: "error", message: "User is not a student!" });
        }
        else {
          GroupModel.findById(groupId)
            .then((group) => {
              if (!group) {
                res.status(400).json({ type: "error", message: "Group does not exist!" });
              }
              else {
                let valid = true;

                for (let i = 0; i < user.groups.length; i++) {
                  if (user.groups[i]._id.equals(group._id)) {
                    valid = false;
                    break;
                  }
                }

                if (!valid) {
                  res.status(400).json({ type: "error", message: "User is already a member of the group!" });
                }
                else {
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
      return res.status(400).json({ message: "Student is not a member of this group" });
    }

    // Remove the student from the group's students array
    group.students = group.students.filter(id => id.toString() !== studentId);
    await group.save();

    // Remove the group from the student's groups array
    student.groups = student.groups.filter(id => id.toString() !== groupId);
    await student.save();

    res.status(200).json({ message: "Student removed from group successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post('/saveRating', verifyJWT, async (req, res) => {
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
    const group = await GroupModel.findById(groupId).populate('ratings');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
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
      existingRating.ConceptualContributionFeedback = ConceptualContributionFeedback;
      existingRating.PracticalContributionRating = PracticalContribution;
      existingRating.PracticalContributionFeedback = PracticalContributionFeedback;
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

    res.status(200).json({ message: 'Successful save' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/getRating', verifyJWT, async (req, res) => {
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
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
