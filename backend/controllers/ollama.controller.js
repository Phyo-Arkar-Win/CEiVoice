import Ticket from "../models/ticket.js";
import { mergeDraftTicketsAI as mergeService } from "../services/ollama.service.js";

export const mergeDraftTickets = async (req, res, next) => {
    const ticketIds = req.body;
    try {
        const tickets = await Ticket.find(
            { _id: { $in: ticketIds } }
        ).lean();
        const mergedTicket = await mergeService(tickets);
        res.json(mergedTicket);
    } catch (err) {
        next(err);
    }
};