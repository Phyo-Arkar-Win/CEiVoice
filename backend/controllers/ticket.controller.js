import Ticket from '../models/ticket.js';
import Comment from '../models/comment.js';
import User from '../models/user.js';
import Scope from '../models/scope.js';
import { mergeDraftTicketsAI, createDraftTicketAI } from '../services/ollama.service.js';
import { sendConfirmationEmail, sendUpdateEmail } from '../services/email/email.service.js';
import { computeEmbedding } from '../services/embedding.service.js';
import { computeAndStoreSimilarities, cleanupRelatedTickets } from '../services/similarity.service.js';

export const getTickets = async (req, res) => {
    const userRole = req.user.role;

    // get all tickets except drafts (for admin)
    if (userRole == "admin") {
        try {
            const tickets = await Ticket.find({
                status: { $ne: "Draft" }
            }).sort({ createdAt: -1 });

            res.status(200).json(tickets);

        } catch (error) {

            res.status(500).json({
                message: `Error loading tickets: ${error.message}`,
            });
        }
    }
    // for users
    else if (userRole == "user") {
        try {
            const userId = req.user.id;
            const tickets = await Ticket
                .find({ $or: [{ followers: { $in: [userId] } }, { creator: userId }] })
                .sort({ createdAt: -1 });
            res.status(200).json({ tickets });

        } catch (error) {
            res.status(500).json({ message: `Error fetching user tickets: ${error.message}` });
        }
    }
}

// Get individual tickets
export const trackTicket = async (req, res) => {
    const currentUser = req.user;
    // For Guest
    if (!currentUser) {
        const ticketId = req.params.id;
        const { email } = req.body;
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
    }
    const userRole = req.user.role;

    // For Users
    if (userRole == "user") {
        const ticketId = req.params.id;
        const { email } = req.body;
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
    }
}

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
export const createNewTicket = async (req, res) => {
    try {
        const id = req.params.id;
        const { title, summary, category, resolution_path, assignee, deadline } = req.body;
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

        if (assignee) {
            const assigneeUser = await User.findOne({
                $or: [{ name: assignee }, { _id: assignee }],
            });
            if (assigneeUser) {
                ticket.assignees.push(assigneeUser._id);
            }
        }

        ticket.deadline = deadline;

        ticket.status = 'New';

        await ticket.save();
        try {
            await Ticket.findByIdAndUpdate(id, { $unset: { suggested_assignee: "" } });
        } catch (err) {
            console.error('[Background] Failed to unset suggested_assignee on submit:', err.message);
        }
        await sendUpdateEmail([ticket.email], ticket);

        res.status(200).json({
            message: 'Draft ticket submitted successfully',
            ticket: ticket,
        });

        // Cleanup after draft to new ticket
        (async () => cleanupRelatedTickets(id).catch(err =>
            console.error('[Background] Cleanup error on submit:', err.message)
        ))();

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: `Error submitting draft ticket: ${error.message}`,
        });
    }
};

// export const viewTicketAsGuest = async (req, res) => {
//     const { email, ticketId } = req.body;
//     try {
//         const ticket = await Ticket.findById(ticketId);
//         if (!ticket) {
//             return res.status(404).json({ message: 'Ticket not found' });
//         }
//         if (ticket.email !== email) {
//             return res.status(403).json({ message: 'Incorrect Email or Ticket ID' });
//         }
//         res.status(200).json({ id: ticket.id, status: ticket.status, title: ticket.title, issue: ticket.issue });
//     } catch (error) {
//         res.status(500).json({
//             message: `Error viewing ticket: ${error.message}`,
//         });
//     }
// };

// export const viewTicketAsUser = async (req, res) => {
//     const { email, ticketId } = req.body;
//     if (!email || !ticketId) {
//         return res.status(400).json({ message: 'Email and Ticket ID are required' });
//     }
//     try {
//         const ticket = await Ticket.findById(ticketId);
//         let creator = await User.findById(ticket.creator);
//         if (ticket.email !== email || creator.email !== email) {
//             return res.status(403).json({ message: 'Incorrect Email or Ticket ID' });
//         }
//         res.status(200).json({ id: ticket.id, status: ticket.status, title: ticket.title, issue: ticket.issue, category: ticket.category, updatedAt: ticket.updatedAt.toLocaleString() });
//     } catch (error) {
//         res.status(500).json({
//             message: `Error viewing ticket: ${error.message}`,
//         });
//     }
// };

export const getTicketDetails = async (req, res) => {
    const userRole = req.user.role;

    // For users
    if (userRole === 'user') {
        const ticketId = req.params.ticketId;
        try {
            const ticket = await Ticket.findById(ticketId).populate('assignees', 'name email').populate('creator', 'name email'); //edtbyRomulus
            if (!ticket) {
                return res.status(404).json({ message: 'Ticket not found' });
            }
            // const rawTicket = await Ticket.findById(ticketId).lean();
            const followersCount = Array.isArray(ticket?.followers) ? ticket.followers.length : 0;
            const publicComments = await Comment.find({ ticket: ticketId, visibility: 'Public' }).populate('user', 'name email role').sort({ createdAt: -1 }); //edtbyRomulus
            res.status(200).json({ ticket, publicComments, followersCount });
        } catch (error) {
            res.status(500).json({
                message: `Error viewing ticket: ${error.message}`,
            });
        }
    }

    // For admins and assignees
    else if (userRole == 'admin' || userRole == 'assignee') {
        const userId = req.user.id;

        const ticketId = req.params.ticketId;
        try {
            const ticket = await Ticket.findById(ticketId)
                .populate('assignees', 'name email')
                .populate('creator', 'name email')
                .populate('relatedTickets.ticketId', 'title category summary status');
            if (!ticket) {
                return res.status(404).json({ message: "Ticket not found" });
            }
            // Get raw follower count from the unpopulated document (followers may contain emails, not ObjectIds)
            const rawTicket = await Ticket.findById(ticketId).lean();
            const followersCount = Array.isArray(rawTicket?.followers) ? rawTicket.followers.length : 0;

            const assignees = await User.find({ role: 'assignee' });
            const publicComments = await Comment.find({ ticket: ticketId, visibility: 'Public' }).populate('user', 'name email role').sort({ createdAt: -1 });
            const internalComments = await Comment.find({ ticket: ticketId, visibility: 'Internal' }).populate('user', 'name email role').sort({ createdAt: -1 });
            const scopes = await Scope.find();

            if (userRole === 'admin') {
                res.status(200).json({ ticket, publicComments, internalComments, scopes, followersCount });
            } else if (userRole === 'assignee') {
                res.status(200).json({ ticket, publicComments, internalComments, scopes, assignees, followersCount });
            }
        } catch (error) {
            res.status(500).json({
                message: `Error viewing ticket: ${error.message}`,
            });
        }
    }
}

// Merge Draft Tickets
export const handleMergeSelection = async (req, res) => {
    try {
        const { tickets } = req.body;

        if (!tickets || !Array.isArray(tickets) || tickets.length < 2) {
            return res.status(400).json({ message: 'At least two tickets are required to merge.' });
        }

        const assignees = await User.find({ role: 'assignee' }).populate('scopes');
        const assigneeList = assignees.map(assignee =>
            `Name: ${assignee.name}
        Scopes: ${assignee.scopes.map(scope => scope.name).join(', ')}`)
            .join('\n');
        const scopes = await Scope.find({}, 'name');
        const scopeList = scopes.map(scope => scope.name).join(', ');
        const ticketList = tickets.map((ticket, index) => `
    Ticket ${index + 1}
    Issue: ${ticket.issue}
    Title: ${ticket.title}
    Summary: ${ticket.summary}
    Category: ${ticket.category}
    Resolution Path: ${ticket.resolution_path}
    `).join("\n");

        const parsedAIResponse = await mergeDraftTicketsAI(scopeList, ticketList, assigneeList);

        const followers = [
            ...new Map(
                tickets.map(ticket => [ticket.creator.toString(), ticket.creator])
            ).values()
        ];

        let suggestedAssignee = await User.findOne({ name: parsedAIResponse.suggested_assignee });

        const mergedTicket = new Ticket({
            issue: parsedAIResponse.issue,
            title: parsedAIResponse.title,
            summary: parsedAIResponse.summary,
            category: parsedAIResponse.category,
            resolution_path: parsedAIResponse.resolution_path,
            suggested_assignee: parsedAIResponse.suggested_assignee,
            followers,
            mergedTickets: tickets.map(ticket => ticket._id),
        });

        res.status(200).json({ message: 'Tickets merged successfully', mergedTicket, suggestedAssignee });
    } catch (error) {
        res.status(500).json({ message: `Error merging tickets: ${error.message}` });
    }
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
        // if (Array.isArray(mergedTicket.assignees) && mergedTicket.assignees.length) {
        //     const selectedAssignee = mergedTicket.assignees[0];
        //     const assigneeUser = await User.findOne({
        //         $or: [{ name: selectedAssignee }, { _id: selectedAssignee }],
        //     });
        //     mergedTicket.assignees = assigneeUser ? [assigneeUser._id] : [];
        // }

        // console.log(mergedTicket.assignees)

        console.log("I'm in ")

        // const assigneeObjects = await User.find({
        // name: { $in: mergedTicket.assignees }
        // });

        // const mergedTicketDoc = new Ticket(mergedTicket);

        // mergedTicketDoc.status = "New";
        // const ticketsToMerge = await Ticket.find({ _id: { $in: mergedTicketDoc.mergedTickets } })
        // const creatorList = ticketsToMerge.map(ticket => ticket.creator)
        // const mergedSourceIds = mergedTicketDoc.mergedTickets.map(id => id._id);
        // await mergedTicketDoc.updateOne({ $set: { status: 'New' } });

        // mergedTicketDoc.followers.push(...creatorList);
        // mergedTicketDoc.assignees = assigneeObjects.map(user => user._id);

        // await Ticket.deleteMany({ _id: { $in: mergedSourceIds } });
        // await mergedTicketDoc.save();
        // let followerEmails = [];
        // for (const followerId of mergedTicketDoc.followers) {
        //     const user = await User.findById(followerId);
        //     if (user) {
        //         followerEmails.push(user.email);
        //     }
        // }
        // console.log('Follower Emails:', followerEmails);
        // await sendUpdateEmail(followerEmails, mergedTicketDoc);
        res.status(200).json({ message: 'Tickets merged successfully', data: mergedTicket });

        // Clean up merging draft tickets to new ticket
        (async () => {
            for (const sourceId of mergedSourceIds) {
                await cleanupRelatedTickets(sourceId);
            }
        })().catch(err => console.error('[Background] Cleanup error on merge:', err.message));
    } catch (error) {
        res.status(500).json({
            message: `Error merging tickets: ${error.message}`,
        });
    }
};

// Reviewed (Tony)
export const createDraftTicket = async (req, res) => {
    const { email, issue } = req.body;
    let user = await User.findOne({ email });
    if (!issue) {
        return res.status(400).json({ error: "Missing message in request body" });
    }
    try {
        const scopes = await Scope.find({}, 'name');
        const scopeList = scopes.map(scope => scope.name).join(', ');

        const assignees = await User.find({ role: 'assignee' }).populate('scopes');
        const assigneesList = assignees.map(a => `${a.name} (Scopes: ${a.scopes.map(s => s.name).join(', ')})`).join('\n');

        const parsedAIResponse = await createDraftTicketAI(issue, scopeList, assigneesList);

        let suggestedAssignee = await User.findOne({ name: parsedAIResponse.suggested_assignee });

        const draftTicket = await Ticket.create({
            email: email,
            issue: issue,
            title: parsedAIResponse.title,
            summary: parsedAIResponse.summary,
            category: parsedAIResponse.category,
            resolution_path: parsedAIResponse.resolution_path,
            original_message: issue,
            creator: user,
            suggested_assignee: parsedAIResponse.suggested_assignee,
        });

        await sendConfirmationEmail(email, draftTicket);
        res.status(200).json({ ticket: draftTicket, suggestedAssignee, message: "Email sent successfully" });

        // Background embedding and compute similarities
        (async () => {
            try {
                const text = draftTicket.issue?.trim() ?? ''
                const embedding = await computeEmbedding(text);
                await Ticket.findByIdAndUpdate(draftTicket._id, { embedding });
                await computeAndStoreSimilarities(draftTicket._id);
            } catch (err) {
                console.error('[Background] Embedding/similarity error on create:', err.message);
            }
        })();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// update draft ticket ( admin can update before submitting )
export const updateDraftTicket = async (req, res) => {
    try {
        const id = req.params.id;
        const { title, summary, category, resolution_path, assignee, deadline } = req.body;
        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        console.log(assignee);

        ticket.title = title;
        ticket.summary = summary;
        ticket.category = category;
        ticket.resolution_path = resolution_path;
        if (assignee) {
            const assigneeUser = await User.findOne({
                $or: [{ name: assignee }, { _id: assignee }],
            });
            ticket.assignees = assigneeUser ? [assigneeUser._id] : [];
        }
        ticket.deadline = deadline;

        await ticket.save();

        res.status(200).json({
            message: 'Draft ticket updated successfully',
            ticket: ticket,
        });

        // Background recomputing embedding and similarities after draft update
        (async () => {
            try {
                const text = ticketToEmbeddingText(ticket);
                const embedding = await computeEmbedding(text);
                await Ticket.findByIdAndUpdate(id, { embedding });
                await computeAndStoreSimilarities(id);
            } catch (err) {
                console.error('[Background] Embedding/similarity error on update:', err.message);
            }
        })();
    } catch (error) {
        res.status(500).json({
            message: `Error updating draft ticket: ${error.message}`,
        });
    }
};


export const updateTicket = async (req, res) => {
    const { ticketId, status, reassignedAssigneeId } = req.body;
    try {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        const reassignedAssignee = await User.findById(reassignedAssigneeId);
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

export const submitComment = async (req, res) => {
    const userRole = req.user.role;
    if (userRole === 'user') {
        const userId = req.user.id;
        const ticketId = req.params.ticketId;
        const { commentText } = req.body;
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
    }
    else if (userRole === 'admin' || userRole === 'assignee') {
        const userId = req.user.id;
        const ticketId = req.params.ticketId;
        const { commentText, visibility } = req.body;
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
            if (visibility === 'Public' && user.role === 'assignee') {
                if (ticket.status !== 'Solved') {
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
    }
}

