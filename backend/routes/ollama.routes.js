import { Router } from 'express';
import AIGenerateDraftTicket, { AIMergeDraftTicket } from '../services/ollama.service.js';
import authController from '../controllers/auth.controller.js';
import Ticket from '../models/ticket.js';

const router = Router();

router.post('/generate', authController.protect, AIGenerateDraftTicket);

router.post('/merge', async (req, res, next) => {
  try {
    const ticketList = await Ticket.find({}).limit(2).lean();

    const result = await AIMergeDraftTicket(ticketList);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;