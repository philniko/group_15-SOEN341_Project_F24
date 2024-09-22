import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

// connect mongodb

app.listen(3001, () => {
  console.log("Server is running on port 3001");
})
