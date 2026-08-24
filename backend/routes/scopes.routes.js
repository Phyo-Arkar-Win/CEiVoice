import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { getScopes, createScope } from '../controllers/scope.controller.js';

const router = Router();

router.get('/', protect, restrictTo('admin'), getScopes);
router.post('/', protect, restrictTo('admin'), createScope);

export default router;