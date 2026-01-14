import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { rateLimiters } from '../middlewares/rate-limiter.middleware';

const router = Router();

// Apply rate limiting to prevent brute force and spam
router.post('/signup', rateLimiters.register, authController.signup);
router.post('/login', rateLimiters.login, authController.login);

export default router;