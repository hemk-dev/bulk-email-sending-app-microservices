import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { getUserMiddleware } from '../middlewares/get-user.middleware';
import { rateLimiters } from '../middlewares/rate-limiter.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/profile', rateLimiters.getUser, getUserMiddleware, userController.getUser);

export default router;
