import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    ratings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ratings'
    }],

    messages: [String]
})

const Group = mongoose.model('Group', GroupSchema);

export default Group;
