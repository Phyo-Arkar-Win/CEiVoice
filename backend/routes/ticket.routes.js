import { Router } from 'express';
import { handleIssueSubmission, mergeDraftTickets, createDraftTicket, getDraftTicketsAsAdmin, handleMergeSelection, handleUnlinkTickets, updateDraftTicket, trackTicket, submitComment, getTicketDetails } from '../controllers/ticket.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = Router();
router.post('/', handleIssueSubmission);
router.get('/drafts', getDraftTicketsAsAdmin);
router.post('/merge/selection', handleMergeSelection);
router.post('/merge/unlink', handleUnlinkTickets);
router.post('/merge', mergeDraftTickets);
router.patch('/:id', createDraftTicket);

// New
router.post('/:ticketId/comments', submitComment)
router.get('/:ticketId', getTicketDetails)


// router.post('/getTicket', getIndividualTicket)

// Completed
router.post('/:id/tracking', trackTicket);


export default router;