import mongoose from "mongoose";

const historyLogSchema = new mongoose.Schema({
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket"
    },
    action: {
        type: String,
        required: true,
        enum: ["StatusChange", "AssigneeChange"]
    },
    fromStatus: {
        type: String,
        required: true,
        default: "Null"
    },
    toStatus: {
        type: String,
        required: true,
        default: "Null"
    },
    fromAssignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: "Null"
    },
    toAssignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: "Null"
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("HistoryLog", historyLogSchema);