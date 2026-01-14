import { Queue } from 'bullmq';
import { loadConfig } from '@packages/config';
import { EmailJobData } from './types';

const config = loadConfig();

export const emailQueue = new Queue('email-send-queue', {
  connection: {
    host: config.redisHost || process.env.REDIS_HOST || 'localhost',
    port: config.redisPort || Number(process.env.REDIS_PORT) || 6379
  }
});

/**
 * Enqueue an email job to the email-send-queue
 * @param jobData - Email job data including campaign, recipient, and sender info
 * @returns Promise<string> - The job ID
 */
export async function enqueueEmailJob(jobData: EmailJobData): Promise<string> {
  const job = await emailQueue.add('send-email', jobData, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000, // Start with 2 seconds
    },
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 1000, // Keep last 1000 completed jobs
    },
    removeOnFail: {
      age: 86400, // Keep failed jobs for 24 hours
    },
  });

  return job.id!;
}
