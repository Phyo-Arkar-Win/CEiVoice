import Ticket from '../models/ticket.js';
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

export const handleMergeSelection = async (req, res) => {
    let tickets = req.body
    let mergedTicket = await AIMergeDraftTickets(tickets)
    res.status(200).json({ message: 'Tickets merged successfully', mergedTicket: mergedTicket });
};

export const handleUnlinkTickets = async (req, res) => {
    const { mergedTicketId, ticketToUnlinkId } = req.body
    try {
        const mergedTicket = await Ticket.findById(mergedTicketId);
        const ticketToUnlink = await Ticket.findById(ticketToUnlinkId);
        if (!mergedTicket || !ticketToUnlink) {
            return res.status(404).json({ message: 'One or both tickets not found' });
        }
        mergedTicket.mergedTickets = mergedTicket.mergedTickets.filter(
            id => !id.equals(ticketToUnlink._id)
        );
        mergedTicket.followers = mergedTicket.followers.filter(
            follower => follower !== ticketToUnlink.creator
        );
    } catch (error) {
        res.status(500).json({
            message: `Error unlinking tickets: ${error.message}`,
        });
    }
    res.status(200).json({ ticket: mergedTicketId, message: 'Tickets unlinked successfully' });
};

export const mergeDraftTickets = async (req, res) => {
    try {
        const { mergedTicketId } = req.body;
        const mergedTicket = await Ticket.findById(mergedTicketId);
        await Ticket.deleteMany({ _id: { $in: mergedTicket.mergedTickets } });
        await mergedTicket.save();
        res.status(200).json({ message: 'Tickets merged successfully', data: mergedTicket });
    } catch (error) {
        res.status(500).json({
            message: `Error merging tickets: ${error.message}`,
        });
    }
};

export const ticketDetailsAsAdminAndAssignee = async (req, res) => {
    const { ticketId } = req.body;
    try {
        const ticket = await Ticket.findById(ticketId);
        const publicComments = await Comment.find({ ticket: ticketId, visibility: 'Public' }, sort);
        const internalComments = await Comment.find({ ticket: ticketId, visibility: 'Internal' });
        res.status(200).json({ ticket, publicComments, internalComments });
    } catch (error) {
        res.status(500).json({
            message: `Error viewing ticket: ${error.message}`,
        });
    }
};