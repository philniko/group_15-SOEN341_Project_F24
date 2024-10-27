import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema({

    rater:{
        type: mongoose.Schema.Types.ObjectID,
        ref:"User",
        required: true
    },

    ratee:{
        type: mongoose.Schema.Types.ObjectID,
        ref:"User",
        required: true
    },

    CooperationRating: {
        type: Number,
        enum: [1,2,3,4,5],
        required: true
    },

    CooperationFeedback:{
        type: String,
    },

    ConceptualContributionRating:{
        type: Number,
        enum: [1,2,3,4,5],
        required: true
    },

    ConceptualContributionFeedback:{
        type: String,
    },

    PracticalContributionRating:{
        type: Number,
        enum: [1,2,3,4,5],
        required: true
    },

    PracticalContributionFeedback:{
        type: String
    },

    WorkEthicRating:{
        type: Number,
        enum: [1,2,3,4,5],
        required: true
    },

    WorkEthicFeedback:{
        type: String
    }

})

const Ratings = mongoose.model('Ratings', RatingSchema);

export default Ratings;