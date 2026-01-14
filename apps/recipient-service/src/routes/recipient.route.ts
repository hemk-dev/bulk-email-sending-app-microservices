import { Router } from 'express';
import { recipientController } from '../controllers/recipient.controller';
import { upload } from '../middlewares/multer.middleware';

const router = Router();

router.post('/single', recipientController.createSingle);
router.post('/bulk', upload.single('file'), recipientController.createBulk);
router.get('/count', recipientController.getCount);
router.get('/batch', recipientController.getBatch);

export default router;
