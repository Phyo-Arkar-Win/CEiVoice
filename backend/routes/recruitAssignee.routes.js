import { Router } from 'express';
import { recruitAssignee, getAssignee } from '../controllers/recruitAssignee.controller.js';
import authController from '../controllers/auth.controller.js';

const router = Router();

router.get("/", authController.protect, getAssignee);
router.post('/', authController.protect, recruitAssignee);

export default router;