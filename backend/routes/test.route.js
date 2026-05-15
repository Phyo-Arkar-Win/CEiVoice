import { Router } from 'express';
import { getAssignees } from '../controllers/assignee.controller.js';
import { login } from '../controllers/auth.controller.js';
import ticket from '../models/ticket.js';
import { mergeDraftTickets } from '../controllers/ollama.controller.js';
const router = Router();

const exampleTickets = await ticket.find({}).limit(2).lean();
router.post('/', login);
router.post('/merge', mergeDraftTickets)

export default router;
