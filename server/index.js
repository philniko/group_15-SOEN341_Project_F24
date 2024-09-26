import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import UserModel from "./models/User.js";
import TeamModel from "./models/Team.js";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
app.use(cors());

//connect mongodb
mongoose.connect("mongodb://localhost:27017/user");
mongoose.createConnection("mongodb://localhost:27017/team");

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
      email: email,
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

//handling getTeams request
app.post("/getTeams", (req, res) => { //request format: {id: String} (user ID)
  if (!req.body.id) {
    res.status(400).json("Missing user ID");
  }
  else {
    UserModel.findById(req.body.id)
      .then((user) => {
        if (!user) {
          res.status(400).json("User not found");
        }
        else {
          //converting each team ID into an object containing the team's info
          const promises = user.teams.map((id) => 
            TeamModel.findById(id)
              .then((team) => {
                if (!team) {
                  throw new Error("Database corrupted");
                }
                else {
                  return team;
                }
              })
          );

          //wait for the promises to resolve and then return the list of teams
          Promise.all(promises)
            .then((teams) => res.status(200).json({teams: teams}))
            .catch((err) => res.status(500).json(err));
        }
      })
      .catch((err) => res.status(500).json(err));
  }
});

//handling team creation
app.post("/createTeam", (req, res) => { //request format: {id: String, name: String} (instructor ID and team name)
  if (!req.body.id) {
    res.status(400).json("Missing instructor ID");
  }
  else if (!req.body.name) {
    res.status(400).json("Missing team name");
  }
  else {
    UserModel.findById(req.body.id)
      .then((user) => {
        if (!user) {
          res.status(400).json("Instructor does not exist");
        }
        else if (user.role != "instructor") {
          res.status(400).json("user is not an instructor");
        }
        else {
          //creating team
          const team = {
            name: req.body.name,
            instructor: {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName
            },
            students: []
          };

          TeamModel.create(team)
            .then((team) => {
              //updating instructor's teams array
              user.teams.push(team._id);
              user.save();
              res.status(200).json(team);
            })
            .catch((err) => res.status(500).json(err));
        }
      })
      .catch((err) => res.status(500).json(err));
  }
});

//handling student addition
app.post("/addStudent", (req, res) => { //request format: {teamId: String, userId: String}
  if (!req.body.teamId) {
    res.status(400).json("Missing team id");
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
        else if (user.teams.includes(req.body.teamId)) {
          res.status(400).json("User is already a member of the team");
        }
        else {
          TeamModel.findById(req.body.teamId)
            .then((team) => {
              if (!team) {
                res.status(400).json("Team does not exist");
              }
              else {
                //updating student teams and team students arrays
                user.teams.push(team._id);
                team.students.push({
                  _id: user._id,
                  firstName: user.firstName,
                  lastName: user.lastName
                });

                user.save();
                team.save();

                res.status(200).json(team);
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
