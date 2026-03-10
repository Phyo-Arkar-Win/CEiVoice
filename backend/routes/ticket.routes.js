import { Router } from 'express';
import { mergeDraftTickets, submitDraftTicket, viewTicketAsGuest, viewTicketAsUser, getDraftTicketsAsAdmin, getIndividualTicket, handleMergeSelection, handleUnlinkTickets, updateDraftTicket } from '../controllers/ticket.controller.js';
import authController from '../controllers/auth.controller.js';

const router = Router();
router.get('/drafts', authController.protect, authController.restrictTo('admin', 'assignee'), getDraftTicketsAsAdmin);
router.post('/merge/selection', handleMergeSelection);
router.post('/merge/unlink', handleUnlinkTickets);
router.post('/merge', mergeDraftTickets);
router.put('/:id/submit', authController.protect, authController.restrictTo('admin', 'assignee'), submitDraftTicket);
router.patch(
  '/:id',
  authController.protect,
  authController.restrictTo('admin', 'assignee'),
  submitDraftTicket
);

router.post('/track/submit', viewTicketAsGuest);
router.post('/track/user', viewTicketAsUser);

router.post('/getTicket', getIndividualTicket)

export default router;
