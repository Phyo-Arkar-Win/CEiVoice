import { Router } from 'express'
import sendEmail from '../services/email/email.service.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();
router.post("/send", sendEmail);

export default router;
