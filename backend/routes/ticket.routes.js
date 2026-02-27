import { Router } from 'express';
import ticketController from '../controllers/ticket.controller.js';

const router = Router();

router.get('/drafts', ticketController.getDraftTickets);
router.put('/:id/submit', ticketController.submitDraftTicket);
router.put('/:id/toDraft', ticketController.newToDraft);

export default router;
