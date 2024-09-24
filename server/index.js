import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import UserModel from "./models/User.js";

const app = express();
app.use(express.json());
app.use(cors());

//connect mongodb
mongoose.connect("mongodb://localhost:27017/user");

//handling register request
app.post("/register", (req, res) => {
  if (!req.body.username) {
    res.json("Please enter a username");
  }
  else if (!req.body.password) {
    res.json("Please enter a password");
  }
  else if (!req.body.firstName) {
    res.json("Please enter a first name");
  }
  else if (!req.body.lastName) {
    res.json("Please enter a last name");
  }
  else if (!req.body.role) {
    res.json("Please choose a role");
  }
  else { //every field is filled
    UserModel.findOne({username: req.body.username}).then((user) => {
      if (user) {
        res.json("Username is already taken");
      }
      else { //every field is valid: proceeding with user creation
        req.body.teams = []
        UserModel.create(req.body)
        .then((user) => res.json(user))
        .catch((err) => res.json(err));
      }
    });
  }
});

//handling login request
app.post("/login", (req, res) => {
  UserModel.findOne({username: req.body.username}).then((user) => {
    if (!user) {
      res.json("User does not exist");
    }
    else if (req.body.password != user.password) {
      res.json("Password is invalid");
    }
    else {
      res.json("Login success!")
    }
  });
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
})
