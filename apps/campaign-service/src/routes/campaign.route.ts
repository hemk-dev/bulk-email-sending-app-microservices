import { Router } from 'express';
import { campaignController } from '../controllers/campaign.controller';
import { userIdMiddleware } from '../middlewares/user-id.middleware';

const router = Router();

// All routes require userId middleware (set by API Gateway)
router.use(userIdMiddleware);

router.post('/', campaignController.create);
router.get('/', campaignController.getAll);
router.get('/:id', campaignController.getById);
router.put('/:id', campaignController.update);
router.delete('/:id', campaignController.delete);
router.post('/:id/prepare', campaignController.prepare);
router.post('/:id/start', campaignController.start);
router.get('/:id/status', campaignController.getStatus);
router.get('/:id/metrics', campaignController.getMetrics);

export default router;
