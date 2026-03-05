import { Router } from 'express';
import recruitAssigneeController from '../controllers/recruitAssignee.controller.js';

const router = Router();

router.post('/', recruitAssigneeController);

export default router;