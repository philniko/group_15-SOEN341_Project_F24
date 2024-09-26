import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import UserModel from "./models/User.js";
import TeamModel from "./models/Team.js";

const app = express();
app.use(express.json());
app.use(cors());

//connect mongodb
mongoose.connect("mongodb://localhost:27017/user");
mongoose.createConnection("mongodb://localhost:27017/team");

//handling register request
app.post("/register", (req, res) => {
  if (!req.body.email) {
    res.json("Please enter an email");
  } else if (!req.body.firstName) {
    res.json("Please enter a first name");
  } else if (!req.body.lastName) {
    res.json("Please enter a last name");
  } else if (!req.body.password) {
    res.json("Please enter a password");
  } else if (!req.body.role) {
    res.json("Please choose a role");
  } else {
    //every field is filled
    UserModel.findOne({ email: req.body.email }).then((user) => {
      if (user) {
        res.json("Username is already taken");
      } else {
        //every field is valid: proceeding with user creation
        req.body.teams = [];
        UserModel.create(req.body)
          .then((user) => res.json(user))
          .catch((err) => res.json(err));
      }
    });
  }
});

//handling login request
app.post("/login", (req, res) => {
  UserModel.findOne({ username: req.body.username }).then((user) => {
    if (!user) {
      res.json("User does not exist");
    } else if (req.body.password != user.password) {
      res.json("Password is invalid");
    } else {
      res.json("Login success!");
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
          const output = Array(user.teams.length);

          //converting each team ID into an object containing the team's info
          for (let i = 0; i < user.teams.length; i++) {
            TeamModel.findById(user.teams[i])
              .then((team) => {
                if (!team) {
                  res.status(500).json("Database corrupted");
                }
                else {
                  output[i] = team;
                }
              })
              .catch((err) => res.status(500).json(err));
          }

          //return the list of teams
          res.status(200).json({teams: output});
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
          req.body.students = [];
          TeamModel.create(req.body)
            .then((team) => {
              //updating instructor teams array
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
                team.students.push(user._id);
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
