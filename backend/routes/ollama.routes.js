import { Router } from 'express';
import generateDraftTicket from '../services/ollama.service.js';
import authController from '../controllers/auth.controller.js';

const router = Router();

router.post('/generate', authController.protect, generateDraftTicket);

export default router;
