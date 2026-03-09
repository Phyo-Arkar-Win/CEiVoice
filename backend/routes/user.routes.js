import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { getUserTickets } from '../controllers/dashboard.controller.js';
import { ticketDetailsAsUser, submitCommentAsUser } from '../controllers/ticket.controller.js';

const router = Router();
router.get('/tickets', getUserTickets);
router.get('/ticketDetails/:id', ticketDetailsAsUser);
router.post('/submitComment', submitCommentAsUser);

export default router;