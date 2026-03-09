import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { getUserTickets } from '../controllers/dashboard.controller.js';

const mockUser = (req, res, next) => {
    req.user = {id: '699b252e3f65cede5154bc40'};
    next();
};
const router = Router();
router.get('/tickets', mockUser, getUserTickets);

export default router;