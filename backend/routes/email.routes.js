import { Router } from 'express'
import sendEmail from '../services/email/email.service.js';
import authController from '../controllers/auth.controller.js';

const router = Router();
router.post("/send", authController.protect, sendEmail);

export default router;
