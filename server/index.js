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
    return res.status(400).json({type: "firstName", message: "Please enter your first name!"});
  }
  if (!lastName) {
    return res.status(400).json({type: "lastName", message: "Please enter your last name!"});
  }
  if (!email) {
    return res.status(400).json({type: "email", message: "Please enter your email!"});
  }
  if (!password) {
    return res.status(400).json({type: "password", message: "Please enter your password!"});
  }
  if (!role) {
    return res.status(400).json({type: "role", message: "Please choose your role!"});
  }

  //checking to see if the user already exists
  try {
    const existingUser = UserModel.findOne({
      email: email
    }).then((user) => {
      if (user) {
        return res.status(409).json({type: "email", message: "The email has already been taken!"});
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
    res.status(500).json({type: "server", message: "Server Registration Error"});
  }
});

//handling login request
app.post("/login", (req, res) => {
  UserModel.findOne({ email: req.body.email }).then((user) => {
    if (!user) {
      res.status(404).json({type: "general", message: "Incorrect email or password!"});
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
        res.status(401).json({type: "general", message: "Incorrect email or password!"});
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
        return res.status(400).json({type: "error", message: "User not found"});
      }
      return res.status(200).json({ groups: user.groups });
    })
    .catch(() => res.status(500).json({type: "error", message: "Server error"}));
});

app.post("/getGroup", verifyJWT, (req, res) => { //request format: {id: String} (team id)
  let { id } = req.body;
  GroupModel.findById(id)
    .populate({ path: "students" })
    .then((group) => res.status(200).json({ group: group }))
    .catch((err) => res.status(500).json(err));
});

app.post("/getStudentGroup", verifyJWT, (req, res) => { //request format: {id: String} (team id)
  let {user} = req.user;
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
    res.status(400).json({type: "error", message: "Missing group id!"});
  }
  else if (!userEmail) {
    res.status(400).json({type: "error", message: "Missing student email!"});
  }
  else {
    UserModel.findOne({ email: userEmail })
      .then((user) => {
        if (!user) {
          res.status(400).json({type: "error", message: "User does not exit!"});
        }
        else if (user.role != "student") {
          res.status(400).json({type: "error", message: "User is not a student!"});
        }
        else {
          GroupModel.findById(groupId)
            .then((group) => {
              if (!group) {
                res.status(400).json({type: "error", message: "Group does not exist!"});
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
                  res.status(400).json({type: "error", message: "User is already a member of the group!"});
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

app.post('/saveRating', verifyJWT, async (req, res) => {
  const { rateeId, Cooperation, ConceptualContribution, PracticalContribution, WorkEthic, CooperationFeedback, ConceptualContributionFeedback, PracticalContributionFeedback, WorkEthicFeedback } = req.body;
  const userId = req.user.id;
  const groupId = req.user.groups.id;
  try {
    // Check if the group exists
    const group = await GroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Create a new rating
    const newRating = new RatingsModel({
      rater: userId,
      ratee: rateeId,
      Cooperation,
      CooperationFeedback,
      ConceptualContribution,
      ConceptualContributionFeedback,
      PracticalContribution,
      PracticalContributionFeedback,
      WorkEthic,
      WorkEthicFeedback,
    });

    // Save the rating
    const savedRating = await newRating.save();

    // Add the rating to the group's ratings array
    group.ratings.push(savedRating._id);
    await group.save();

    res.status(200).json({ message: 'Rating saved successfully', rating: savedRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
