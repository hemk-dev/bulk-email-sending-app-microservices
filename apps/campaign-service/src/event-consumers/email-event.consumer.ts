import Redis from 'ioredis';
import { loadConfig } from '@packages/config';
import { logInfo, logError } from '@packages/logger';
import { emailLogService } from '../services/email-log.service';

const config = loadConfig();

/**
 * Email Event Consumer
 * Listens to email.sent and email.failed events from worker
 */
export function createEmailEventConsumer(): Redis {
  const channelPrefix = process.env.EVENT_BUS_CHANNEL_PREFIX || 'email-events';
  const subscriber = new Redis({
    host: config.redisHost || process.env.REDIS_HOST || 'localhost',
    port: config.redisPort || Number(process.env.REDIS_PORT) || 6379,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  subscriber.on('error', (err) => {
    logError('Redis subscriber error', { error: err.message });
  });

  subscriber.on('connect', () => {
    logInfo('Email event consumer connected to Redis');
  });

  // Subscribe to email events
  subscriber.subscribe(`${channelPrefix}:email.sent`, `${channelPrefix}:email.failed`);

  subscriber.on('message', async (channel, message) => {
    try {
      const eventData = JSON.parse(message);

      if (channel.includes('email.sent')) {
        logInfo('Received email.sent event', {
          campaignId: eventData.campaignId,
          jobId: eventData.jobId,
        });

        await emailLogService.handleEmailSentEvent({
          campaignId: eventData.campaignId,
          jobId: eventData.jobId,
          recipientEmail: eventData.recipientEmail,
          sentAt: eventData.sentAt ? new Date(eventData.sentAt) : undefined,
          attempts: eventData.attempts || 1,
        });
      } else if (channel.includes('email.failed')) {
        logInfo('Received email.failed event', {
          campaignId: eventData.campaignId,
          jobId: eventData.jobId,
        });

        await emailLogService.handleEmailFailedEvent({
          campaignId: eventData.campaignId,
          jobId: eventData.jobId,
          recipientEmail: eventData.recipientEmail,
          error: eventData.error,
          failedAt: eventData.failedAt ? new Date(eventData.failedAt) : undefined,
          attempts: eventData.attempts || 1,
        });
      }
    } catch (error: any) {
      logError('Error processing email event', {
        error: error.message,
        channel,
        stack: error.stack,
      });
      // Don't throw - continue processing other events
    }
  });

  logInfo('Email event consumer started', {
    channels: [`${channelPrefix}:email.sent`, `${channelPrefix}:email.failed`],
  });

  return subscriber;
}
