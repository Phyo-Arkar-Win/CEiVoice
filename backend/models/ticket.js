import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
    {
        email: { type: String },
        issue: { type: String },
        title: { type: String, required: true },
        summary: { type: String, required: true },
        category: { type: String, required: true },
        resolution_path: [{ type: String, required: true }],
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
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }, 
        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        mergedTickets: [{
            type: mongoose.Schema.Types.ObjectId, ref: 'Ticket'    
        }],
        deadline: { type: Date },
    },
    { timestamps: true },
);

export default mongoose.model('Ticket', ticketSchema);