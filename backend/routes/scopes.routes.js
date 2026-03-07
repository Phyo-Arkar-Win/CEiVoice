import { Router } from 'express'; 
import { getScopes, createScope } from '../controllers/scope.controller.js'; 

const router = Router();

router.get('/', getScopes);
router.post('/', createScope);

export default router;