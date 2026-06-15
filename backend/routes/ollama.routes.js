import { Router } from 'express';
import { mergeDraftTicketsAI } from '../controllers/ollama.controller.js';
import { createDraftTicketAI } from '../services/ollama.service.js';
import { protect } from '../middlewares/auth.middleware.js';
import Ticket from '../models/ticket.js';

const router = Router();

router.post('/drafts', createDraftTicketAI);
router.post('/merge', mergeDraftTicketsAI);

export default router;