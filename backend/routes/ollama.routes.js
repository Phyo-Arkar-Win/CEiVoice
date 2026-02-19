import { Router } from 'express';
import { generateDraftTicket } from '../services/ollama.service.js';

const router = Router();

router.post('/generate', generateDraftTicket);

export default router;
