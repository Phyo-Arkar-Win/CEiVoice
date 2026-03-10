import { Router } from 'express';
import { getAssigneeDashboardData } from '../controllers/dashboard.controller.js';
import authController from '../controllers/auth.controller.js';
import getHistoryLog  from '../controllers/historyLog.controller.js';
import { ticketDetailsAsAdminOrAssignee, submitCommentAsAdminOrAssignee } from '../controllers/ticket.controller.js';
import { get } from 'mongoose';

const router = Router();
router.get('/dashboard', authController.protect, getAssigneeDashboardData);
router.get('/ticketDetailsAsAdminOrAssignee', ticketDetailsAsAdminOrAssignee);
router.post('/commentAsAdminOrAssignee', submitCommentAsAdminOrAssignee);
router.get('/history', authController.protect, authController.restrictTo('assignee'), getHistoryLog);

export default router;  