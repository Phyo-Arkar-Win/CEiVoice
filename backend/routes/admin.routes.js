import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { getAdminDashboardData } from '../controllers/dashboard.controller.js';
import { getAssignee } from '../controllers/recruitAssignee.controller.js';
import { ticketDetailsAsAdminOrAssignee, submitCommentAsAdminOrAssignee  } from '../controllers/ticket.controller.js';

const router = Router();
router.get('/dashboard', getAdminDashboardData);
router.get('/assignee', getAssignee);
router.get('/ticketDetails', ticketDetailsAsAdminOrAssignee);
router.post('/commentAsAdminOrAssignee', submitCommentAsAdminOrAssignee );

export default router;