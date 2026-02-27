import Ticket from '../models/ticket.js';

// get all draft tickets for admin
const getDraftTickets = async (req, res) => {
    try {
        const draftTickets = await Ticket.find({ status: 'Draft' });
        res.status(200).json(draftTickets);
    } catch (error) {
        res.status(500).json({
            message: `Error loading draft tickets: ${error.message}`,
        });
    }
};

// Create a new ticket from draft | submit draft ticket
const submitDraftTicket = async (req, res) => {
    try {
        const id = req.params.id;
        const { title, summary, category, resolution_path, assignees } =
            req.body;
        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        ticket.status = 'New';
        if (title !== undefined) ticket.title = title;
        if (summary !== undefined) ticket.summary = summary;
        ticket.category = category;
        ticket.resolution_path = resolution_path;
        ticket.assignees = assignees;
        // if (ticket.creator && !ticket.followers.includes(ticket.creator)) {
        //   ticket.followers.push(ticket.creator);
        // }
        await ticket.save();

        res.status(200).json({
            message: 'Draft ticket submitted successfully',
            data: ticket,
        });
    } catch (error) {
        res.status(500).json({
            message: `Error submitting draft ticket: ${error.message}`,
        });
    }
};

// For testing purpose only, change ticket status back to draft
const newToDraft = async (req, res) => {
    const id = req.params.id;
    try {
        const ticket = await Ticket.findById(id);
        ticket.status = 'Draft';
        await ticket.save();
        res.status(201).json({
            message: 'Ticket status changed to Draft',
            data: ticket,
        });
    } catch (error) {
        res.status(500).json({
            message: `Error changing ticket status to Draft: ${error.message}`,
        });
    }
};

export default { getDraftTickets, submitDraftTicket, newToDraft };
