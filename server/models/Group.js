import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({

    groupName: {
        type: String,
        required: true
    },

    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]

})

const Group = mongoose.model('Group', GroupSchema);

export default Group;
