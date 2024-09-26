import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    email: String,
    firstName: String,
    lastName: String,
    password: String,
    role: String,
    teams: [String]     //array of team IDs
});

const UserModel = mongoose.model("user", UserSchema);
export default UserModel;