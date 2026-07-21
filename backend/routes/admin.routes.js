import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { getDashboardData } from '../controllers/dashboard.controller.js';
import { getAssignees, createAssignee } from '../controllers/assignee.controller.js';
import { getTickets } from '../controllers/ticket.controller.js';

const router = Router();

// yyk
router.get('/dashboard', protect, getDashboardData);

// Completed
router.get("/tickets", protect, getTickets);
router.get('/assignees', protect, getAssignees);
router.post('/assignees', protect, createAssignee);


// Moved to tickets route
// router.post('/tickets/:ticketId/comments', submitComment);
// router.get('/tickets/:ticketId', getTicketDetails);


export default router;
