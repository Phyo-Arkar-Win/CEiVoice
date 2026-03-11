import Ticket from '../models/ticket.js';
import Comment from '../models/comment.js';
import User from '../models/user.js';
import Scope from '../models/scope.js';
import { AIMergeDraftTickets } from '../services/ollama.service.js';
import { sendUpdateEmail } from '../services/email/email.service.js';

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

// Submit a new ticket from draft | submit draft ticket
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
        await sendUpdateEmail([ticket.email], ticket);

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
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }
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
        let creator = await User.findById(ticket.creator);
        if (ticket.email !== email || creator.email !== email) {
            return res.status(403).json({ message: 'Incorrect Email or Ticket ID' });
        }
        res.status(200).json({ id: ticket.id, status: ticket.status, title: ticket.title, issue: ticket.issue, category: ticket.category, updatedAt: ticket.updatedAt.toLocaleString() });
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
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }
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
    let [mergedTicket, suggestedAssignee] = await AIMergeDraftTickets(tickets);
    res.status(200).json({ message: 'Tickets merged successfully', mergedTicket: mergedTicket, suggestedAssignee: suggestedAssignee });
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
        const { mergedTicket } = req.body;
        const mergedTicketDoc = new Ticket(mergedTicket);
        mergedTicketDoc.status = "New";

        const ticketsToMerge = await Ticket.find({ _id: { $in: mergedTicketDoc.mergedTickets } })
        const creatorList = ticketsToMerge.map(ticket => ticket.creator)
        await mergedTicketDoc.updateOne({ $set: { status: 'New' } });
        mergedTicketDoc.followers.push(...creatorList);
        await Ticket.deleteMany({ _id: { $in: mergedTicketDoc.mergedTickets.map(id => id._id) } });
        await mergedTicketDoc.save();
        let followerEmails = [];
        for (const followerId of mergedTicketDoc.followers) {
            const user = await User.findById(followerId);
            if (user) {
                followerEmails.push(user.email);
            }
        }
        await sendUpdateEmail(followerEmails, mergedTicketDoc);
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
        const id = req.params.id;
        const { title, summary, category, resolution_path, assignees, deadline } = req.body;
        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        ticket.title = title;
        ticket.summary = summary;
        ticket.category = category;
        ticket.resolution_path = resolution_path;
        ticket.assignees = assignees;
        ticket.deadline = deadline;

        await ticket.save();

        res.status(200).json({
            message: 'Draft ticket updated successfully',
            ticket: ticket,
        });
    } catch (error) {
        res.status(500).json({
            message: `Error updating draft ticket: ${error.message}`,
        });
    }
};

export const ticketDetailsAsAdminOrAssignee = async (req, res) => {
    const userId = req.user.id;
    const ticketId = req.params.id;
    try {
        const ticket = await Ticket.findById(ticketId).populate('assignees', 'name email').populate('creator', 'name email');
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // Get raw follower count from the unpopulated document (followers may contain emails, not ObjectIds)
        const rawTicket = await Ticket.findById(ticketId).lean();
        const followersCount = Array.isArray(rawTicket?.followers) ? rawTicket.followers.length : 0;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const assignees = await User.find({ role: 'assignee' });
        const publicComments = await Comment.find({ ticket: ticketId, visibility: 'Public' }).populate('user', 'name email role').sort({ createdAt: -1 });
        const internalComments = await Comment.find({ ticket: ticketId, visibility: 'Internal' }).populate('user', 'name email role').sort({ createdAt: -1 });
        const scopes = await Scope.find();

        if (user.role === 'admin') {
            res.status(200).json({ ticket, publicComments, internalComments, scopes, followersCount });
        } else if (user.role === 'assignee') {
            res.status(200).json({ ticket, publicComments, internalComments, scopes, assignees, followersCount });
        }
    } catch (error) {
        res.status(500).json({
            message: `Error viewing ticket: ${error.message}`,
        });
    }
};

export const ticketDetailsAsUser = async (req, res) => {
    const ticketId = req.params.id;
    try {
        const ticket = await Ticket.findById(ticketId).populate('assignees', 'name email').populate('creator', 'name email'); //edtbyRomulus
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        const rawTicket = await Ticket.findById(ticketId).lean();
        const followersCount = Array.isArray(rawTicket?.followers) ? rawTicket.followers.length : 0;
        const publicComments = await Comment.find({ ticket: ticketId, visibility: 'Public' }).populate('user', 'name email role').sort({ createdAt: -1 }); //edtbyRomulus
        res.status(200).json({ ticket, publicComments, followersCount });
    } catch (error) {
        res.status(500).json({
            message: `Error viewing ticket: ${error.message}`,
        });
    }
};

// export const saveAsAssignee = async (req, res) => {
//     const { ticketId, status, reassignedAssigneeId } = req.body;
//     try {
//         let ticket = await Ticket.findById(ticketId);
//         if (!ticket) {
//             return res.status(404).json({ message: "Ticket not found" });
//         }
//         const reassignedAssignee = await User.findById(reassignedAssigneeId);

//         // console.log(reassignedAssignee)
        
        
//         if (status === "Solving") {
//             ticket.status = status;
//         } 
//         else if (status === "Solved" || status === "Failed") {
//             const commented = await Comment.find({ ticket: ticket, user: req.user.id });
            
            
//             if (!commented.length) {
//                 return res.status(400).json({ message: 'You must comment before marking the ticket as solved' });
//             }
//             ticket.status = status;
//         }

//         if (reassignedAssignee) {
//             if (!ticket.assignees.includes(reassignedAssignee)) {
//                 ticket.assignees.push(reassignedAssignee);
//             }
//         }
//         console.log(ticket) 

//         await ticket.save();
//         console.log("What")
//         res.status(200).json({ ticket });
//     } catch (error) {
//         res.status(500).json({
//             message: `Error updating ticket: ${error.message}`,
//         });
//     }
// }

export const saveAsAssignee = async (req, res) => {
    const { ticketId, status, reassignedAssigneeId } = req.body;
    try {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        const updateFields = {};

        if (status === "Solved") {
            const commented = await Comment.find({ ticket: ticketId, user: req.user.id });
            if (!commented.length) {
                return res.status(400).json({ message: `You must comment before marking the ticket as ${status.toLowerCase()}` });
            }
        }
        if (status) {
            updateFields.status = status;
        }

        if (reassignedAssignee) {
            ticket.assignees.push(reassignedAssignee);
        }

        await ticket.save();

        let followerEmails = [];
        const recipients = new Set();
        if (ticket.email) recipients.add(ticket.email);

        for (const followerId of ticket.followers) {
            const user = await User.findById(followerId);
            if (user) {
                recipients.add(user.email);
            }
        }
        followerEmails = Array.from(recipients);

        if (followerEmails.length > 0) {
            await sendUpdateEmail(followerEmails, ticket);
        }

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
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }
        const user = await User.findById(userId);
        const newComment = new Comment({
            user: userId,
            ticket: ticketId,
            comment: commentText,
        });
        await newComment.save();
        res.status(201).json({ message: 'Comment added successfully', comment: newComment, name: user.name, role: user.role });
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
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }
        const user = await User.findById(userId);
        const newComment = new Comment({
            user: userId,
            ticket: ticketId,
            comment: commentText,
            visibility
        });
        if ( visibility === 'Public' && user.role === 'assignee' ) {
            if ( ticket.status !== 'Solved' ) {
                await Ticket.findByIdAndUpdate(ticketId, { status: 'Solving' });
             }
        }
        await newComment.save();
        res.status(201).json({ message: 'Comment added successfully', comment: newComment, name: user.name, role: user.role });
    } catch (error) {
        res.status(500).json({
            message: `Error adding comment: ${error.message}`,
        });
    }
};
