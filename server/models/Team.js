import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema({
    name: String,        //team name
    instructor: {        //instructor information
        _id: String,
        firstName: String,
        lastName: String
    },
    students: [{         //array of student information
        _id: String,
        firstName: String,
        lastName: String
    }]   
});

const TeamModel = mongoose.model("team", TeamSchema);
export default TeamModel;