import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket"
    },
    visibility: {
        type: String,
        enum: ["Internal", "Public"],
        default: "Public",
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("Comment", commentSchema);

