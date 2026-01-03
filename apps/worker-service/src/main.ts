import { Worker } from 'bullmq';
import { TraceContext } from '@packages/tracing';
import { logInfo } from '@packages/logger';
import { loadConfig } from '@packages/config';

const config = loadConfig();

new Worker(
  'email-queue',
  async (job) => {
    const { traceId, message } = job.data;

    TraceContext.run(traceId, async () => {
      logInfo('Worker received job', { message });

      await simulateWork();

      logInfo('Worker finished job');
    });
  },
  {
    connection: {
      host: config.redisHost,
      port: config.redisPort
    }
  }
);

async function simulateWork() {
  return new Promise((resolve) => setTimeout(resolve, 20000));
}
