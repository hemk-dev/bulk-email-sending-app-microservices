import { Router } from 'express';
import { logInfo } from '@packages/logger';

const router = Router();

router.post('/signup', async (_req, res) => {
  logInfo('Signup controller hit');

  res.json({
    message: 'Signup completed'
  });
});

export default router;