import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    role: String,
    teams: [String]
});

const UserModel = mongoose.model("user", UserSchema);
export default UserModel;