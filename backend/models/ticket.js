import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
    {
        email: { type: String, required: true },
        issue: { type: String, required: true },
        title: { type: String, required: true },
        summary: { type: String, required: true },
        category: { type: String, required: true },
        resolution_path: [{ type: String, required: true }],
        status: {
            type: String,
            enum: [
                'Draft',
                'New',
                'Assigned',
                'Solving',
                'Solved',
                'Failed',
                'Renew',
            ],
            default: 'Draft',
        },
        creator: { type: String },
        followers: [{ type: String }],
        assignees: [{ type: String }],
    },
    { timestamps: true },
);

export default mongoose.model('Ticket', ticketSchema);
