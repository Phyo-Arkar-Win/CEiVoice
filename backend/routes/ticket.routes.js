import { Router } from 'express';
import ticketController from '../controllers/ticket.controller.js';
import authController from '../controllers/auth.controller.js';

const router = Router();

router.get('/drafts', authController.protect, authController.restrictTo('admin', 'assignee'), ticketController.getDraftTickets);
router.put('/merge', authController.protect, authController.restrictTo('admin', 'assignee'), ticketController.mergeDraftTickets);
router.put('/:id/submit', authController.protect, authController.restrictTo('admin', 'assignee'), ticketController.submitDraftTicket);

router.post('/track/submit', ticketController.viewTicketAsGuest);

export default router;
