import { logInfo } from '@packages/logger';
import { enqueueTestJob } from '@packages/queue';

export const traceTestService = {
  async execute() {
    logInfo('Trace test service started');

    // simulate async boundary
    await enqueueTestJob();

    logInfo('Trace test service completed');
  }
};

