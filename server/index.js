import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import UserModel from "./models/User.js";
import bcrypt from "bcryptjs"; //TODO: hash password
import jwt from 'jsonwebtoken';
import config from 'configs';

const app = express();
app.use(express.json());
app.use(cors());

//connect mongodb
mongoose.connect(config.mongoURL);

//handling register request
app.post("/register", (req, res) => {
  if (!req.body.email) {
    res.json("Please enter an email");
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
    UserModel.findOne({email: req.body.email}).then((user) => {
      if (user) {
        res.json("Email is already in use");
      }
      else { //every field is valid: proceeding with user creation
        req.body.teams = []
        UserModel.create(req.body)
        .then(() => res.json("success!"))
        .catch((err) => res.json(err));
      }
    });
  }
});

//handling login request
app.post("/login", (req, res) => {
  UserModel.findOne({email: req.body.email}).then((user) => {
    if (!user) {
      res.json("User does not exist");
    }
    else if (req.body.password != user.password) {
      res.json("Password is invalid");
    }
    else {
      const payload = {user: {email: user.email}};
      jwt.sign(payload, config.jwtSecret, {expirsIn: 3600},
      (err, token) => {
        if (err) throw err;
        res.json({token});
      });
    }
  });
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
})
