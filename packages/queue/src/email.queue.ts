import { Queue } from 'bullmq';
import { TraceContext } from '@packages/tracing';

export const emailQueue = new Queue('email-queue', {
  connection: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
});

export async function enqueueTestJob() {
  await emailQueue.add('trace-test-job', {
    traceId: TraceContext.getTraceId(),
    message: 'hello-from-api'
  });
}
