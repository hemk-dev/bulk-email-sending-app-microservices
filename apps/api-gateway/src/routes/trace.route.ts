import { Router } from 'express';
import { logInfo } from '@packages/logger';
import { traceTestService } from 'src/services/trace.service';

const router = Router();

router.post('/trace-test', async (_req, res) => {
  logInfo('Trace test controller hit');

  await traceTestService.execute();

  res.json({
    message: 'Trace test completed'
  });
});

export default router;