import { Router } from 'express';
import { mergeDraftTickets, submitDraftTicket, viewTicketAsGuest, viewTicketAsUser, getDraftTicketsAsAdmin, getIndividualTicket, updateDraftTicket } from '../controllers/ticket.controller.js';
import authController from '../controllers/auth.controller.js';

const router = Router();

router.get('/drafts', authController.protect, authController.restrictTo('admin', 'assignee'), getDraftTicketsAsAdmin);
router.put('/merge', authController.protect, authController.restrictTo('admin', 'assignee'), mergeDraftTickets);
router.put('/:id/submit', authController.protect, authController.restrictTo('admin', 'assignee'), submitDraftTicket);
router.put(
  '/:id',
  authController.protect,
  authController.restrictTo('admin', 'assignee'),
  updateDraftTicket
);

router.post('/track/submit', viewTicketAsGuest);
router.post('/track/user', viewTicketAsUser);

router.post('/getTicket', getIndividualTicket)

export default router;
