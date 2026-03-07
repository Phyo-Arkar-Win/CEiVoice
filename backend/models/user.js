import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String },
    name: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', "assignee"], default: 'user' },
    scopes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Scope"
        }
    ]
}, { timestamps: true });

export default mongoose.model('User', userSchema);