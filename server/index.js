import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import UserModel from "./models/User.js";
import GroupModel from "./models/Group.js";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
app.use(cors());

//connect mongodb
mongoose.connect("mongodb://localhost:27017/User");
mongoose.createConnection("mongodb://localhost:27017/Group");

//handling register request
app.post("/register", (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  //making sure all fields are filled
  if (!firstName) {
    return res.status(400).json("Please enter a first name");
  }
  if (!lastName) {
    return res.status(400).json("Please enter a last name");
  }
  if (!email) {
    return res.status(400).json("Please enter an email");
  }
  if (!password) {
    return res.status(400).json("Please enter a password");
  }
  if (!role) {
    return res.status(400).json("Please chose a role");
  }

  //checking to see if the user already exists
  try {
    const existingUser = UserModel.findOne({
      email: email
    }).then((user) => {
      if (user) {
        return res.status(409).json("Email is already taken");
      }
    });

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
  } catch (error) {
    console.error(error);
    res.status(500).json("Server Registration Error");
  }
});

// //handling login request
app.post("/login", (req, res) => {
  UserModel.findOne({ email: req.body.email }).then((user) => {
    if (!user) {
      res.status(404).json("User does not exist");
    } else {
      const validPassword = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (validPassword) {
        res.status(200).json("Login successful");
      } else {
        res.status(401).json("Invalid password");
      }
    }
  });
});

//handling getGroups request
app.post("/getGroups", (req, res) => { //request format: {id: String} (user ID)
  if (!req.body.id) {
    res.status(400).json("Missing user ID");
  }
  else {
    UserModel.findById(req.body.id)
      .populate("groups")
      .then((user) => {
        if (!user) {
          res.status(400).json("User not found");
        }
        else {
          res.status(200).json({groups: user.groups})
        }
      })
      .catch((err) => res.status(500).json(err));
  }
});

//handling group creation
app.post("/createGroup", (req, res) => { //request format: {id: String, name: String} (instructor ID and team name)
  if (!req.body.id) {
    res.status(400).json("Missing instructor ID");
  }
  else if (!req.body.name) {
    res.status(400).json("Missing group name");
  }
  else {
    UserModel.findById(req.body.id)
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
            name: req.body.name,
            instructor: user,
            students: []
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
  }
});

//handling student addition
app.post("/addStudent", (req, res) => { //request format: {groupId: String, userId: String}
  if (!req.body.groupId) {
    res.status(400).json("Missing group id");
  }
  else if (!req.body.userId) {
    res.status(400).json("Missing student id");
  }
  else {
    UserModel.findById(req.body.userId)
      .then((user) => {
        if (!user) {
          res.status(400).json("User does not exit");
        }
        else if (user.role != "student") {
          res.status(400).json("User is not a student");
        }
        else {
          GroupModel.findById(req.body.groupId)
            .then((group) => {
              if (!group) {
                res.status(400).json("Group does not exist");
              }
              else if (user.groups.includes(group)) {
                res.status(400).json("User is already a member of the group");
              }
              else {
                //updating student groups and group students arrays
                user.groups.push(group);
                group.students.push(user);

                user.save();
                group.save();

                res.status(200).json(group);
              }
            })
            .catch((err) => res.status(500).json(err));
        }
      })
      .catch((err) => res.status(500).json(err));
  }
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
