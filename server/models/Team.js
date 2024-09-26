import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema({
    name: String,        //team name
    instructor: String,  //instructor ID
    students: [String]   //student IDs
});

const TeamModel = mongoose.model("team", TeamSchema);
export default TeamModel;