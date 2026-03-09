import Ticket from '../models/ticket.js';
import Comment from '../models/comment.js';
import User from '../models/user.js';
import { AIMergeDraftTicket } from '../services/ollama.service.js';

// Get all draft tickets for admin
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

// Merge tickets
export const mergeDraftTickets = async (req, res) => {
    try {
        const { ticketIds } = req.body;

        if (!ticketIds || ticketIds.length < 2) {
            return res
                .status(400)
                .json({ message: 'Select at least 2 draft tickets to merge.' });
        }

        const tickets = await Ticket.find({
            _id: { $in: ticketIds },
        });

        if (tickets.length !== ticketIds.length) {
            return res
                .status(404)
                .json({ message: 'One or more tickets not found.' });
        }
 
        const merged = await AIMergeDraftTicket(tickets);
        
        res.status(200).json({ merged });
    } catch (error) {
        res.status(500).json({
            message: `Error merging tickets: ${error.message}`,
        });
    }
};

// for (let i = 1; i < tickets.length; i++) {
//             merged.followers.push(...tickets[i].creator);
//             tickets[i].status = 'Merged';
//             await tickets[i].save();
//         }

// PUT : Submit a new ticket from draft | submit draft ticket
export const submitDraftTicket = async (req, res) => {
    try {
        const id = req.params.id;
        const { title, summary, category, resolution_path, assignees } =
            req.body;
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

        if (title !== undefined) ticket.title = title;
        if (summary !== undefined) ticket.summary = summary;
        if (category !== undefined) ticket.category = category;
        if (resolution_path !== undefined)
            ticket.resolution_path = resolution_path;
        if (assignees !== undefined) ticket.assignees = assignees;

        let allFollowers = []; // get all creator emails ( parent + merged )
        if (ticket.creator) {
            allFollowers.push(ticket.creator);
        }

        let mergedTickets = [];

        if (ticket.mergedRequestIds.length > 0) {
            mergedTickets = await Ticket.find({
                _id: { $in: ticket.id },
            });
        }

        mergedTickets.forEach((mergedTicket) => {
            if (mergedTicket.creator) {
                allFollowers.push(mergedTicket.creator);
            }
        });

        // remove duplicates
        const uniqueFollowers = [...new Set(allFollowers)];
        ticket.followers = uniqueFollowers;

        ticket.status = 'New';

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
