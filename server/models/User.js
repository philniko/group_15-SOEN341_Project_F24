import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
 
    firstName:{
        type: String,
        required: true
    },

    lastName:{
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    role:{
        type: String,
        enum: [ 'student', 'instructor'],
        default: 'student'
    },

    password:{
        type: String, 
        required: true
    },

    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }],

    ratings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ratings'
    }]

    })

    //Hashing logic
    UserSchema.pre('save', async function (next) {
        const user = this;
        if (user.isModified('password')){
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        }
        next();
    });

    const User = mongoose.model("User",UserSchema);

    export default User;