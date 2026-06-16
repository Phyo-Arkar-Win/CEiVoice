import { Router } from 'express';
import { mergeDraftTickets } from '../controllers/ollama.controller.js';
import { createDraftTicketAI } from '../services/ollama.service.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/drafts', createDraftTicketAI);
router.post('/merge', mergeDraftTickets);

export default router;