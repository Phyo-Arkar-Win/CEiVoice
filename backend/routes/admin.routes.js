import { Router } from 'express';
import { getAdminDashboardData } from '../controllers/dashboard.controller.js';

const router = Router();
router.get('/dashboard', getAdminDashboardData);

export default router;