import { Router } from 'express';
import { createDraftTicket, mergeDraftTickets, createNewTicket, getDraftTickets, getMergeRecommendations, handleMergeSelection, handleUnlinkTickets, updateDraftTicket, trackTicket, submitComment, getTicketDetails } from '../controllers/ticket.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = Router();
router.post('/drafts', createDraftTicket);
router.get('/drafts', protect, restrictTo('admin'), getDraftTickets);
router.get('/drafts/mergeRecommendations', protect, restrictTo('admin'), getMergeRecommendations);
router.post('/merge/selection', protect, restrictTo('admin'), handleMergeSelection);
router.post('/merge/unlink', protect, restrictTo('admin'), handleUnlinkTickets);
router.post('/merge', protect, restrictTo('admin'), mergeDraftTickets);
router.patch('/drafts/:id', protect, restrictTo('admin'), updateDraftTicket);
router.patch('/:id', protect, restrictTo('admin'), createNewTicket);

// New
router.post('/:ticketId/comments', protect, restrictTo('user', 'admin', 'assignee'), submitComment)
router.get('/:ticketId', protect, restrictTo('user', 'admin', 'assignee'), getTicketDetails)


// router.post('/getTicket', getIndividualTicket)

// Completed
router.post('/:id/tracking', trackTicket);


export default router;