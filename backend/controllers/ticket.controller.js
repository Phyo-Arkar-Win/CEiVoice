import Ticket from '../models/ticket.js';

// GET : Get all draft tickets for admin
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

//PUT :  Merge tickets
const mergeDraftTickets = async (req, res) => {
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

        for (let ticket of tickets) {
            if (ticket.status !== 'Draft') {
                return res.status(400).json({
                    message: 'All selected tickets must be draft.',
                });
            }
        }

        const parent = tickets[0];
        for (let i = 1; i < tickets.length; i++) {
            const child = tickets[i];
            child.parentTicketId = parent._id;
            child.status = 'Merged';

            await child.save();

            parent.mergedRequestIds.push(child._id);
        }

        await parent.save();

        res.status(200).json({
            message: 'Tickets merged successfully',
            parentTicket: parent,
        });
    } catch (error) {
        res.status(500).json({
            message: `Error merging tickets: ${error.message}`,
        });
    }
};

// PUT : Submit a new ticket from draft | submit draft ticket
const submitDraftTicket = async (req, res) => {
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

const viewTicketAsGuest = async (req, res) => {
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

export default { getDraftTickets, mergeDraftTickets, submitDraftTicket, viewTicketAsGuest};
