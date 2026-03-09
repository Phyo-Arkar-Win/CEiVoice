import { Router } from 'express';
import { getDraftTickets, mergeDraftTickets, submitDraftTicket, viewTicketAsGuest, viewTicketAsUser } from '../controllers/ticket.controller.js';
import authController from '../controllers/auth.controller.js';

const router = Router();

router.get('/drafts', authController.protect, authController.restrictTo('admin', 'assignee'), getDraftTickets);
router.put('/merge', authController.protect, authController.restrictTo('admin', 'assignee'), mergeDraftTickets);
router.put('/:id/submit', authController.protect, authController.restrictTo('admin', 'assignee'), submitDraftTicket);

router.post('/track/submit', viewTicketAsGuest);
router.post('/track/user', viewTicketAsUser);

export default router;
