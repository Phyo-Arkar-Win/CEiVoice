import 'dotenv/config';
import mongoose from 'mongoose';
import Ticket from '../models/ticket.js';

const TOP_N = Number(process.env.RELATED_TICKETS_LIMIT || 3);
const THRESHOLD = Number(process.env.RELATED_TICKETS_THRESHOLD || 0.8);
const VECTOR_INDEX = process.env.ATLAS_VECTOR_INDEX || 'ticket_vector_index';

export const computeAndStoreSimilarities = async (ticketId) => {
    try {
        // 1. Fetch the target ticket's embedding
        const targetTicket = await Ticket.findById(ticketId).select('status embedding');
        if (!targetTicket) {
            return;
        }

        if (targetTicket.status !== 'Draft' || !targetTicket.embedding?.length) {
            await cleanupRelatedTickets(ticketId);
            console.warn(`[Similarity] Ticket ${ticketId} is not an embedded draft, skipping.`);
            return;
        }

        const ticketObjectId = new mongoose.Types.ObjectId(ticketId);

        // A changed embedding can invalidate old reciprocal links. Remove those
        // links before calculating and storing the current top matches.
        await Ticket.updateMany(
            { 'relatedTickets.ticketId': ticketObjectId },
            { $pull: { relatedTickets: { ticketId: ticketObjectId } } },
        );

        // 2. Atlas Vector Search — finds the most similar Draft tickets in the DB
        //    filter: pre-filters to Draft status inside the search engine (efficient)
        //    numCandidates: pool size Atlas considers before ranking (>= limit)
        //    limit: fetch a few extra to absorb threshold filtering after
        const results = await Ticket.aggregate([
            {
                $vectorSearch: {
                    index: VECTOR_INDEX,
                    path: 'embedding',
                    queryVector: targetTicket.embedding,
                    numCandidates: Math.max(TOP_N * 10, 20),
                    limit: TOP_N + 5,
                    filter: { status: { $eq: 'Draft' } }
                }
            },
            {
                $addFields: {
                    similarityScore: { $meta: 'vectorSearchScore' }
                }
            },
            {
                // Post-filter: exclude the ticket itself and apply score threshold
                $match: {
                    _id: { $ne: ticketObjectId },
                    similarityScore: { $gte: THRESHOLD }
                }
            },
            { $limit: TOP_N },
            {
                $project: {
                    _id: 1,
                    relatedTickets: 1,
                    similarityScore: 1
                }
            }
        ]);

        // 3. Overwrite the target ticket's relatedTickets
        await Ticket.findByIdAndUpdate(ticketId, {
            relatedTickets: results.map(({ _id, similarityScore }) => ({
                ticketId: _id,
                similarityScore,
            })),
        });

        if (!results.length) {
            console.log(`[Similarity] Ticket ${ticketId}: no similar drafts above threshold.`);
            return;
        }

        // 4. Reciprocal update — matched tickets also point back to this ticket
        for (const match of results) {
            let relations = (match.relatedTickets || []).map(r => ({
                ticketId: r.ticketId,
                similarityScore: r.similarityScore,
            }));

            const existingIndex = relations.findIndex(
                r => r.ticketId.toString() === ticketId.toString()
            );

            if (existingIndex >= 0) {
                // Update the score if the link already exists
                relations[existingIndex].similarityScore = match.similarityScore;
            } else {
                // Add a new back-link
                relations.push({ ticketId, similarityScore: match.similarityScore });
            }

            // Re-sort and trim to keep the matched ticket's list clean
            relations = relations
                .filter(r => r.similarityScore >= THRESHOLD)
                .sort((a, b) => b.similarityScore - a.similarityScore)
                .slice(0, TOP_N);

            await Ticket.findByIdAndUpdate(match._id, { relatedTickets: relations });
        }

        console.log(`[Similarity] Ticket ${ticketId}: found ${results.length} similar draft(s).`);
    } catch (err) {
        console.error('[Similarity] computeAndStoreSimilarities error:', err.message);
    }
};

export const cleanupRelatedTickets = async (ticketId) => {
    try {
        // Remove this ticket from every other ticket's relatedTickets array
        await Ticket.updateMany(
            { 'relatedTickets.ticketId': ticketId },
            { $pull: { relatedTickets: { ticketId } } }
        );

        // Clear this ticket's own relatedTickets — no longer relevant
        await Ticket.findByIdAndUpdate(ticketId, { relatedTickets: [] });

        console.log(`[Similarity] Cleaned up relatedTickets for ticket ${ticketId}.`);
    } catch (err) {
        console.error('[Similarity] cleanupRelatedTickets error:', err.message);
    }
};
