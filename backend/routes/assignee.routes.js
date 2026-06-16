import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { getHistoryLogs } from '../controllers/history-log.controller.js';
import { saveAsAssignee } from '../controllers/ticket.controller.js';
import { getAssigneeDashboardData } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/dashboard', getAssigneeDashboardData);
router.get('/history', getHistoryLogs);

router.post('/save-ticket', saveAsAssignee);

// Moved to tickets route
// router.get('/tickets/:id', getTicketDetails);
// router.post('/submitComment', submitComment); 


export default router;      