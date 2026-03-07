import { Router } from 'express';
import { recruitAssignee, getAssignee } from '../controllers/recruitAssignee.controller.js';

const router = Router();

router.get("/", getAssignee)
router.post('/', recruitAssignee);

export default router;