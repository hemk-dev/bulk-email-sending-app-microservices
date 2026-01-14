import { Worker } from 'bullmq';
import { loadConfig } from '@packages/config';
import { TraceContext } from '@packages/tracing';
import { logInfo, logError } from '@packages/logger';
import { EmailJobData } from '@packages/queue';
import { emailService } from '../services/email.service';
import { encryptionUtil } from '../shared/utils/encryption.util';
import { eventPublisherService } from '../services/event-publisher.service';
import { emailLogRepository } from '../repositories/email-log.repository';

const config = loadConfig();
const concurrency = Number(process.env.WORKER_CONCURRENCY) || 5;

/**
 * Email Queue Worker
 * 
 * Processes email jobs from BullMQ queue with idempotent email sending.
 * 
 * Idempotency Flow:
 * 1. Attempt atomic INSERT into email_logs (ON CONFLICT DO NOTHING)
 *    - If insert fails (already exists) → Exit immediately (email already processed)
 *    - If insert succeeds → Continue
 * 2. Update status to SENDING
 * 3. Send email via SMTP
 * 4. On success: Update status to SENT, store provider_message_id
 * 5. On failure: Update status to FAILED, store error_message
 * 
 * This ensures no email is sent more than once per (campaign_id, recipient_email)
 * even under concurrent processing, retries, crashes, or worker restarts.
 */
export function createEmailWorker(): Worker {
  const worker = new Worker<EmailJobData>(
    'email-send-queue',
    async (job) => {
      const jobData = job.data;
      const { jobId, campaignId, recipientId, to, subject, html, sender, traceId } = jobData;
      const attempts = job.attemptsMade + 1;

      // Set trace context for observability
      TraceContext.run(traceId, async () => {
        try {
          logInfo('Processing email job', {
            jobId,
            campaignId,
            recipientId,
            recipientEmail: to,
            attempts,
          });

          // Step 1: Attempt atomic INSERT with idempotency check
          // This uses ON CONFLICT DO NOTHING to prevent duplicate emails
          const insertResult = await emailLogRepository.insertWithConflictHandling(
            campaignId,
            to
          );

          // If insert failed (conflict occurred), email was already processed
          // Exit immediately - this is the idempotency safety check
          if (!insertResult.inserted) {
            logInfo('Email already processed (idempotent skip)', {
              jobId,
              campaignId,
              recipientEmail: to,
              attempts,
            });
            // Job completed successfully (no error thrown, just exit)
            return;
          }

          // Step 2: Update status to SENDING (after successful insert)
          await emailLogRepository.updateStatus(
            campaignId,
            to,
            'SENDING'
          );

          logInfo('Email log entry created, starting email send', {
            jobId,
            campaignId,
            recipientEmail: to,
            emailLogId: insertResult.id,
          });

          // Step 3: Decrypt SMTP password
          const decryptedPassword = await encryptionUtil.decrypt(sender.smtp.passwordEncrypted);

          // Prepare SMTP config with decrypted password
          const smtpConfig = {
            ...sender.smtp,
            passwordEncrypted: decryptedPassword, // Replace encrypted with decrypted
          };

          // Step 4: Send email via SMTP
          const sendResult = await emailService.sendEmail(smtpConfig, to, subject, html);

          // Step 5: On success - Update status to SENT and store provider_message_id
          await emailLogRepository.updateStatus(
            campaignId,
            to,
            'SENT',
            sendResult.providerMessageId,
            null
          );

          // Emit success event (for backward compatibility with event consumers)
          await eventPublisherService.publishEmailSentEvent({
            campaignId,
            jobId,
            recipientEmail: to,
            sentAt: new Date(),
            attempts,
          });

          logInfo('Email job completed successfully', {
            jobId,
            campaignId,
            recipientId,
            recipientEmail: to,
            providerMessageId: sendResult.providerMessageId,
          });
        } catch (error: any) {
          const errorMessage = error.message || 'Unknown error';
          logError('Email job failed', {
            error: errorMessage,
            jobId,
            campaignId,
            recipientId,
            recipientEmail: to,
            attempts,
            stack: error.stack,
          });

          // On failure - Update status to FAILED and store error_message
          // Only update if we successfully inserted the log entry
          // (insertResult.inserted would be true if we got past the insert step)
          try {
            await emailLogRepository.updateStatus(
              campaignId,
              to,
              'FAILED',
              null,
              errorMessage
            );
          } catch (updateError: any) {
            // Log update error but don't fail the job processing
            logError('Failed to update email log status to FAILED', {
              error: updateError.message,
              campaignId,
              recipientEmail: to,
            });
          }

          // Emit failure event (for backward compatibility with event consumers)
          await eventPublisherService.publishEmailFailedEvent({
            campaignId,
            jobId,
            recipientEmail: to,
            error: errorMessage,
            failedAt: new Date(),
            attempts,
          });

          // Re-throw to let BullMQ handle retries
          throw error;
        }
      });
    },
    {
      connection: {
        host: config.redisHost || process.env.REDIS_HOST || 'localhost',
        port: config.redisPort || Number(process.env.REDIS_PORT) || 6379,
      },
      concurrency,
      removeOnComplete: {
        age: 3600, // Keep completed jobs for 1 hour
        count: 1000, // Keep last 1000 completed jobs
      },
      removeOnFail: {
        age: 86400, // Keep failed jobs for 24 hours
      },
    }
  );

  worker.on('completed', (job) => {
    logInfo('Job completed', {
      jobId: job.id,
      campaignId: job.data.campaignId,
    });
  });

  worker.on('failed', (job, err) => {
    logError('Job failed', {
      jobId: job?.id,
      campaignId: job?.data?.campaignId,
      error: err.message,
      attempts: job?.attemptsMade,
    });
  });

  worker.on('error', (err) => {
    logError('Worker error', {
      error: err.message,
      stack: err.stack,
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logInfo('SIGTERM received, closing worker gracefully');
    await worker.close();
    await eventPublisherService.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logInfo('SIGINT received, closing worker gracefully');
    await worker.close();
    await eventPublisherService.close();
    process.exit(0);
  });

  logInfo('Email worker started', {
    queue: 'email-send-queue',
    concurrency,
  });

  return worker;
}
