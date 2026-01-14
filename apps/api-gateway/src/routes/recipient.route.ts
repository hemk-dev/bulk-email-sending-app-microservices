import { Router } from 'express';
import { recipientController } from '../controllers/recipient.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import multer from 'multer';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.post('/single', recipientController.createSingle);
router.post('/bulk', upload.single('file'), recipientController.createBulk);
router.get('/count', recipientController.getCount);
router.get('/batch', recipientController.getBatch);

export default router;
