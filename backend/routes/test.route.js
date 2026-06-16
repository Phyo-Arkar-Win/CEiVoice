import { Router } from 'express';
import { getAssignees } from '../controllers/assignee.controller.js';
import { login } from '../controllers/auth.controller.js';
import { mergeDraftTickets } from '../controllers/ollama.controller.js';
const router = Router();

router.post('/', login);
router.post('/merge', mergeDraftTickets);

export default router;
