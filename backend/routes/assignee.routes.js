import { Router } from 'express';
import { getAssigneeDashboardData } from '../controllers/dashboard.controller.js';
import authController from '../controllers/auth.controller.js';

const router = Router();
router.get('/dashboard', authController.protect, getAssigneeDashboardData);

export default router;  