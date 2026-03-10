import Ticket from '../models/ticket.js';
import Comment from '../models/comment.js';
import User from '../models/user.js';
import { AIMergeDraftTickets } from '../services/ollama.service.js';

export const getDraftTicketsAsAdmin = async (req, res) => {
    try {
        const draftTickets = await Ticket.find({ status: 'Draft' });
        res.status(200).json(draftTickets);
    } catch (error) {
        res.status(500).json({
            message: `Error loading draft tickets: ${error.message}`,
        });
    }
};

// PUT : Submit a new ticket from draft | submit draft ticket
export const submitDraftTicket = async (req, res) => {
    try {
        const id = req.params.id;
        const { title, summary, category, resolution_path, assignees, deadline } = req.body;
        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // check draft
        if (ticket.status !== 'Draft') {
            return res
                .status(400)
                .json({ message: 'Only Draft tickets can be submitted' });
        }

        ticket.title = title;
        ticket.summary = summary;
        ticket.category = category;
        ticket.resolution_path = resolution_path;
        ticket.assignees = assignees;
        ticket.deadline = deadline;
        ticket.status = 'New';

        await ticket.save();

        res.status(200).json({
            message: 'Draft ticket submitted successfully',
            ticket: ticket,
        });
    } catch (error) {
        res.status(500).json({
            message: `Error submitting draft ticket: ${error.message}`,
        });
    }
};

export const viewTicketAsGuest = async (req, res) => {
    const { email, ticketId } = req.body;
    try {
        const ticket = await Ticket.findById(ticketId);
        if (ticket.email !== email) {
            return res.status(403).json({ message: 'Incorrect Email or Ticket ID' });
        }
        res.status(200).json({ id: ticket.id, status: ticket.status, title: ticket.title, issue: ticket.issue });
    } catch (error) {
        res.status(500).json({
            message: `Error viewing ticket: ${error.message}`,
        });
    }
};

export const viewTicketAsUser = async (req, res) => {
    const { email, ticketId } = req.body;
    if (!email || !ticketId) {
        return res.status(400).json({ message: 'Email and Ticket ID are required' });
    }
    try {
        const ticket = await Ticket.findById(ticketId);
        if (ticket.email !== email || ticket.creator !== email) {
            return res.status(403).json({ message: 'Incorrect Email or Ticket ID' });
        }
        res.status(200).json({ id: ticket.id, status: ticket.status, title: ticket.title, issue: ticket.issue });
    } catch (error) {
        res.status(500).json({
            message: `Error viewing ticket: ${error.message}`,
        });
    }
};

export const getIndividualTicket = async (req, res) => {
    const { ticketId } = req.body;
    try {
        const ticket = await Ticket.findById(ticketId);
        res.status(200).json({ title: ticket.title, category: ticket.category, summary: ticket.summary, resolution_path: ticket.resolution_path });
    } catch (error) {
        res.status(500).json({
            message: `Error viewing ticket: ${error.message}`,
        });
    }
};

// Merge Draft Tickets

export const handleMergeSelection = async (req, res) => {
    const { tickets } = req.body;
    let mergedTicket = await AIMergeDraftTickets(tickets);
    // console.log(mergedTicket);
    res.status(200).json({ message: 'Tickets merged successfully', mergedTicket: mergedTicket });
};

export const handleUnlinkTickets = async (req, res) => {
    const { mergedTicket, ticketToUnlinkId } = req.body;
    try {
        const ticketToUnlink = await Ticket.findById(ticketToUnlinkId);
        if (!ticketToUnlink) {
            return res.status(404).json({ message: 'Ticket to unlink not found' });
        }

        const mergedTicketDoc = new Ticket(mergedTicket);

        console.log(mergedTicketDoc);

        mergedTicketDoc.mergedTickets.pull(ticketToUnlinkId);

        if (ticketToUnlink.creator) {
            mergedTicketDoc.followers.pull(ticketToUnlink.creator);
        }

        return res.status(200).json({
            mergedTicket: mergedTicketDoc,
            message: 'Tickets unlinked successfully'
        });
    } catch (error) {
        return res.status(500).json({
            message: `Error unlinking tickets: ${error.message}`,
        });
    }
};

export const mergeDraftTickets = async (req, res) => {
    try {
        const { mergedTicketId } = req.body;
        const mergedTicket = new Ticket(mergedTicket);
        mergedTicket.status = "New";
        // await Ticket.deleteMany({ _id: { $in: mergedTicket.mergedTickets } });
        // await mergedTicket.updateOne({ $set: { status: 'New' } });
        await mergedTicket.save();
        res.status(200).json({ message: 'Tickets merged successfully', data: mergedTicket });
    } catch (error) {
        res.status(500).json({
            message: `Error merging tickets: ${error.message}`,
        });
    }
};

// update draft ticket ( admin can update before submitting )
export const updateDraftTicket = async (req, res) => {
    try {

        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            req.body,   // <-- important
            { new: true }
        );

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        res.status(200).json({
            message: "Draft updated",
            ticket
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Update failed",
            error: error.message
        });
    }
};

export const ticketDetailsAsAdminOrAssignee = async (req, res) => {
    const { ticketId } = req.body;
    try {
        const ticket = await Ticket.findById(ticketId);
        const publicComments = await Comment.find({ ticket: ticketId, visibility: 'Public' }).sort({ createdAt: -1 });
        const internalComments = await Comment.find({ ticket: ticketId, visibility: 'Internal' }).sort({ createdAt: -1 });
        res.status(200).json({ ticket, publicComments, internalComments });
    } catch (error) {
        res.status(500).json({
            message: `Error viewing ticket: ${error.message}`,
        });
    }
};

export const ticketDetailsAsUser = async (req, res) => {
    const { ticketId } = req.body;
    try {
        const ticket = await Ticket.findById(ticketId);
        const publicComments = await Comment.find({ ticket: ticketId, visibility: 'Public' }).sort({ createdAt: -1 });
        res.status(200).json({ ticket, publicComments });
    } catch (error) {
        res.status(500).json({
            message: `Error viewing ticket: ${error.message}`,
        });
    }
};

export const saveAsAssignee = async (req, res) => {
    const { ticketId, status, reassignedAssigneeId } = req.body;
    try {
        const ticket = await Ticket.findById(ticketId);
        const reassignedAssignee = await User.findById(reassignedAssigneeId);
        if (status !== "Solved") {
            ticket.status = status;
        } else if (status === "Solved") {
            const commented = await Comment.find({ ticket: ticketId, user: req.user.id });

            if (!commented.length) {
                return res.status(400).json({ message: 'You must comment before marking the ticket as solved' });
            }
        }

        if (reassignedAssignee) {
            ticket.assignees.push(reassignedAssignee);
        }

        await ticket.save();
        res.status(200).json({ ticket });
    } catch (error) {
        res.status(500).json({
            message: `Error updating ticket: ${error.message}`,
        });
    }
}

export const submitCommentAsUser = async (req, res) => {
    const userId = req.user.id;
    const { ticketId, commentText } = req.body;
    try {
        const ticket = await Ticket.findById(ticketId);
        const user = await User.findById(userId);
        const newComment = new Comment({
            user,
            ticket,
            comment: commentText,
        });
        await newComment.save();
        res.status(200).json({ message: 'Comment added successfully', comment: newComment, name: user.name, role: user.role });
    } catch (error) {
        res.status(500).json({
            message: `Error adding comment: ${error.message}`,
        });
    }
};

export const submitCommentAsAdminOrAssignee = async (req, res) => {
    const userId = req.user.id;
    const { ticketId, commentText, visibility } = req.body;
    try {
        const ticket = await Ticket.findById(ticketId);
        const user = await User.findById(userId);
        const newComment = new Comment({
            user,
            ticket,
            comment: commentText,
            visibility
        });
        await newComment.save();
        res.status(200).json({ message: 'Comment added successfully', comment: newComment, name: user.name, role: user.role });
    } catch (error) {
        res.status(500).json({
            message: `Error adding comment: ${error.message}`,
        });
    }
};
