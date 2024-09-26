import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import UserModel from "./models/User.js";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
app.use(cors());

//connect mongodb
mongoose.connect("mongodb://localhost:27017/user");

//handling register request
app.post("/register", (req, res) => {
  if (!req.body.email) {
    res.status(400).json("Please enter an email");
  } else if (!req.body.firstName) {
    res.status(400).json("Please enter a first name");
  } else if (!req.body.lastName) {
    res.status(400).json("Please enter a last name");
  } else if (!req.body.password) {
    res.status(400).json("Please enter a password");
  } else if (!req.body.role) {
    res.status(400).json("Please choose a role");
  } else {
    //every field is filled
    UserModel.findOne({ email: req.body.email }).then((user) => {
      if (user) {
        return res
          .status(409)
          .json("An account already exists with this email");
      } else {
        //every field is valid: proceeding with user creation
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);
        req.body.password = hash;
        req.body.teams = [];
        UserModel.create(req.body)
          .then((user) => res.status(201).json(user))
          .catch((err) =>
            res.status(500).json("An error occurred during registration")
          );
      }
    });
  }
});

//handling login request
app.post("/login", (req, res) => {
  UserModel.findOne({ email: req.body.email}).then((user) => {
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

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
