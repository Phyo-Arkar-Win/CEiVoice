import { Router } from 'express';
import { getAdminDashboardData } from '../controllers/dashboard.controller.js';
import { getAssignee } from '../controllers/recruitAssignee.controller.js';

const router = Router();
router.get('/dashboard', getAdminDashboardData);
router.get('/assignee', getAssignee);

export default router;