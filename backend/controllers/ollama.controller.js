// import ticket from "../models/ticket.js";
import Ticket from "../models/ticket.js";
import { mergeDraftTicketsAI as mergeService } from "../services/ollama.service.js";

// export const mergeDraftTicketsAI = async (req, res, next) => {
//     const ticketIds = req.body;
//     try {
//         const tickets = await Ticket.find(
//             { _id: { $in: ticketIds } }
//         ).lean();
//         console.log(tickets)
        
//         // const mergedTicket = await mergeService(tickets);

//         res.json(tickets);
//     } catch (err) {
//         next(err);
//     }
// }

export const mergeDraftTicketsAI = async (req, res, next) => {
    const ticketIds = req.body;

    try {
        console.log("Mongo Ready State:", mongoose.connection.readyState);

        const tickets = await Ticket.find({
            _id: { $in: ticketIds }
        }).lean();

        console.log(tickets);

        res.json(tickets);
    } catch (err) {
        next(err);
    }
};