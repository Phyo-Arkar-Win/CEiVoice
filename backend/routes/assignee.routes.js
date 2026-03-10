import { Router } from 'express';
import { getAssigneeDashboardData } from '../controllers/dashboard.controller.js';
import authController from '../controllers/auth.controller.js';
import { ticketDetailsAsAdminOrAssignee, submitCommentAsAdminOrAssignee, saveAsAssignee } from '../controllers/ticket.controller.js';

const router = Router();
router.get('/dashboard', authController.protect, getAssigneeDashboardData);
router.get('/ticketDetails/:id', ticketDetailsAsAdminOrAssignee);
router.post('/submitComment', submitCommentAsAdminOrAssignee);
router.post('/saveTicket', saveAsAssignee);

export default router;  