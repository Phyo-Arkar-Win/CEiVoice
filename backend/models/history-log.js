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
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    fromStatus: {
        type: String,
    },
    toStatus: {
        type: String,
    },
    
    preAssignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    newAssignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("HistoryLog", historyLogSchema);