import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { getTicketDetails, submitComment, getTickets } from '../controllers/ticket.controller.js';

const router = Router();
router.get('/tickets', protect, getTickets);

// Moved to tickets route
// router.get('/tickets/:ticketId', getTicketDetails);
// router.post('/tickets/:ticketId/comments', submitComment);

export default router;