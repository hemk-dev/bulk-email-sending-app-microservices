import { AppDataSource } from '../config/data-source';
import { logInfo, logError } from '@packages/logger';

/**
 * Email Log Repository for Worker Service
 * 
 * Handles database operations for email_logs table using raw SQL queries.
 * Uses schema-qualified table names (campaign.email_logs) to access all schemas.
 * 
 * This repository implements idempotent operations using atomic INSERT with
 * ON CONFLICT DO NOTHING pattern to prevent duplicate email sends.
 */
class EmailLogRepository {
  /**
   * Attempts to insert a new email log entry atomically.
   * Uses ON CONFLICT DO NOTHING to handle race conditions and duplicates.
   * 
   * This method is idempotent - if a row with the same (campaign_id, recipient_email)
   * already exists, the insert will silently fail and return inserted: false.
   * 
   * @param campaignId - Campaign UUID
   * @param recipientEmail - Recipient email address
   * @returns Object indicating if insert succeeded and the ID if it did
   */
  async insertWithConflictHandling(
    campaignId: string,
    recipientEmail: string
  ): Promise<{ inserted: boolean; id?: string }> {
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Atomic INSERT with ON CONFLICT DO NOTHING
      // This ensures no duplicate emails are sent even under concurrent processing
      const result = await queryRunner.query(
        `INSERT INTO campaign.email_logs 
         (id, "campaignId", "recipientEmail", status, "createdAt", "updatedAt")
         VALUES 
         (uuid_generate_v4(), $1, $2, 'PENDING', NOW(), NOW())
         ON CONFLICT ("campaignId", "recipientEmail") 
         DO NOTHING
         RETURNING id`,
        [campaignId, recipientEmail]
      );

      await queryRunner.commitTransaction();

      // If result has rows, insert succeeded
      if (result && result.length > 0) {
        const id = result[0].id;
        logInfo('Email log entry inserted successfully', {
          id,
          campaignId,
          recipientEmail,
        });
        return { inserted: true, id };
      } else {
        // No rows returned means conflict occurred - email already processed
        logInfo('Email log entry already exists (idempotent skip)', {
          campaignId,
          recipientEmail,
        });
        return { inserted: false };
      }
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      logError('Failed to insert email log entry', {
        error: error.message,
        campaignId,
        recipientEmail,
        stack: error.stack,
      });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Updates the status of an email log entry.
   * 
   * @param campaignId - Campaign UUID
   * @param recipientEmail - Recipient email address
   * @param status - New status (PENDING | SENDING | SENT | FAILED)
   * @param providerMessageId - Optional provider message ID (for SENT status)
   * @param errorMessage - Optional error message (for FAILED status)
   */
  async updateStatus(
    campaignId: string,
    recipientEmail: string,
    status: 'PENDING' | 'SENDING' | 'SENT' | 'FAILED',
    providerMessageId?: string | null,
    errorMessage?: string | null
  ): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Build UPDATE query dynamically based on provided fields
      const updates: string[] = [`status = $3`, `"updatedAt" = NOW()`];
      const params: any[] = [campaignId, recipientEmail, status];
      let paramIndex = 4;

      if (providerMessageId !== undefined) {
        updates.push(`"providerMessageId" = $${paramIndex}`);
        params.push(providerMessageId);
        paramIndex++;
      }

      if (errorMessage !== undefined) {
        updates.push(`"errorMessage" = $${paramIndex}`);
        params.push(errorMessage);
        paramIndex++;
      }

      const updateQuery = `
        UPDATE campaign.email_logs
        SET ${updates.join(', ')}
        WHERE "campaignId" = $1 AND "recipientEmail" = $2
      `;

      await queryRunner.query(updateQuery, params);
      await queryRunner.commitTransaction();

      logInfo('Email log status updated', {
        campaignId,
        recipientEmail,
        status,
      });
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      logError('Failed to update email log status', {
        error: error.message,
        campaignId,
        recipientEmail,
        status,
        stack: error.stack,
      });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

// Export a singleton instance
export const emailLogRepository = new EmailLogRepository();
