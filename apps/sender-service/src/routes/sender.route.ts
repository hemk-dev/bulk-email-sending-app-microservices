import { Router } from 'express';
import { senderController } from '../controllers/sender.controller';
import { userIdMiddleware } from '../middlewares/user-id.middleware';

const router = Router();

// All routes require userId middleware (set by API Gateway)
router.use(userIdMiddleware);

router.post('/', senderController.create);
router.get('/', senderController.getAll);
router.get('/validate-email', senderController.validateEmail);
router.get('/:id', senderController.getById);
router.put('/:id', senderController.update);
router.delete('/:id', senderController.delete);

export default router;
