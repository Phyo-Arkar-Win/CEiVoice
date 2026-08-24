import { Router } from 'express';
import { mergeDraftTickets } from '../controllers/ollama.controller.js';
import { createDraftTicketAI } from '../services/ollama.service.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/drafts', protect, restrictTo('admin'), createDraftTicketAI);
router.post('/merge', protect, restrictTo('admin'), mergeDraftTickets);

export default router;