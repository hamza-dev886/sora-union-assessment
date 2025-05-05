import { Router, RequestHandler } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', authController.register as RequestHandler);
router.post('/login', authController.login as RequestHandler);
router.get('/profile', authenticateToken as RequestHandler, authController.getProfile as RequestHandler);

export default router;