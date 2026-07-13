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
    },
    toStatus: {
        type: String,
    },
    fromAssignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    toAssignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("HistoryLog", historyLogSchema);