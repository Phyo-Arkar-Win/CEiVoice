import { Router } from 'express';
import ticketController from '../controllers/ticket.controller.js';

const router = Router();

router.get('/drafts', ticketController.getDraftTickets);
router.put('/merge', ticketController.mergeDraftTickets);
router.put('/:id/submit', ticketController.submitDraftTicket);

router.post('/track/submit', ticketController.viewTicketAsGuest);

export default router;
