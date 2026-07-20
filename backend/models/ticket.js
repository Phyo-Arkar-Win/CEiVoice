import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
    {
        email: { type: String },
        issue: { type: String },
        title: { type: String, required: true },
        summary: { type: String, required: true },
        category: { type: String, required: true },
        resolution_path: [{ type: String, required: true }],
        suggested_assignee: { type: String },
        status: {
            type: String,
            enum: [
                'Draft',
                'New',
                'Solving',
                'Solved',
                'Failed',
            ],
            default: 'Draft',
        },
        embedding: { type: [Number], default: [] },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        relatedTickets: [{
            ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
            similarityScore: { type: Number },
        }],
        mergedTickets: [{
            type: mongoose.Schema.Types.ObjectId, ref: 'Ticket'
        }],
        deadline: { type: Date },
    },
    { timestamps: true },
);

export default mongoose.model('Ticket', ticketSchema);