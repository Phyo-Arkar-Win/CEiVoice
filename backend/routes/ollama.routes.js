import { Router } from 'express';
import { mergeDraftTickets } from '../controllers/ollama.controller.js';
import { createDraftTicket } from '../services/ollama.service.js';
import { protect } from '../middlewares/auth.middleware.js';
import Ticket from '../models/ticket.js';

const router = Router();

router.post('/drafts', createDraftTicket);
router.post('/merge', mergeDraftTickets);

export default router;