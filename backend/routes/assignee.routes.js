import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { getHistoryLogs } from '../controllers/history-log.controller.js';
import { updateTicket } from '../controllers/ticket.controller.js';
import { getDashboardData } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/dashboard', protect, restrictTo('assignee', 'admin'), getDashboardData);
router.get('/history', protect, restrictTo('assignee'), getHistoryLogs);

router.post('/update-ticket', protect, restrictTo('assignee'), updateTicket);
router.post('/saveTicket', protect, restrictTo('assignee'), updateTicket);

// Moved to tickets route
// router.get('/tickets/:id', getTicketDetails);
// router.post('/submitComment', submitComment); 


export default router;      