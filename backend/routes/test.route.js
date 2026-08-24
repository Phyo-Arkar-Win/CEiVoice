import { Router } from 'express';
import { getAssignees } from '../controllers/assignee.controller.js';
import { login } from '../controllers/auth.controller.js';
import { mergeDraftTickets } from '../controllers/ollama.controller.js';
import { computeEmbedding } from '../services/embedding.service.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
const router = Router();

router.post('/', login);
router.post('/merge', protect, restrictTo('admin'), mergeDraftTickets);
router.post('/embed', protect, restrictTo('admin'), computeEmbedding);

export default router;
