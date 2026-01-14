import { Router } from 'express';
import { senderController } from '../controllers/sender.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Service-to-service endpoint (no auth required, uses X-User-Id header)
router.get('/validate-email', senderController.validateEmail);

// All other routes require authentication
router.use(authMiddleware);

router.post('/add', senderController.create);
router.get('/', senderController.getAll);
router.get('/:id', senderController.getById);
router.put('/:id', senderController.update);
router.delete('/:id', senderController.delete);

export default router;
