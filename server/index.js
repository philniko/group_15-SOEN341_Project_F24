import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import UserModel from "./models/User.js";
import bcrypt from "bcrypt";

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

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
