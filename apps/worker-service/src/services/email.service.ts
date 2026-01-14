import nodemailer from 'nodemailer';
import { logInfo, logError } from '@packages/logger';
import { SenderSmtpConfig } from '@packages/queue';

/**
 * Email Service
 * Handles email sending using Nodemailer
 */
export const emailService = {
  /**
   * Send email using SMTP configuration
   * 
   * @returns Object containing providerMessageId from SMTP response
   */
  async sendEmail(
    smtpConfig: SenderSmtpConfig,
    to: string,
    subject: string,
    html: string
  ): Promise<{ providerMessageId: string | null }> {
    try {
      logInfo('Preparing to send email', { to, subject });

      // Create transporter
      // Note: passwordEncrypted field actually contains the decrypted password at this point
      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
          user: smtpConfig.username,
          pass: smtpConfig.passwordEncrypted, // Already decrypted by worker
        },
      });

      // Verify connection
      await transporter.verify();

      // Send email
      const info = await transporter.sendMail({
        from: smtpConfig.username, // Or use a from field from sender config
        to,
        subject,
        html,
      });

      logInfo('Email sent successfully', {
        to,
        subject,
        messageId: info.messageId,
      });

      return {
        providerMessageId: info.messageId || null,
      };
    } catch (error: any) {
      logError('Failed to send email', {
        error: error.message,
        to,
        subject,
        stack: error.stack,
      });
      throw error;
    }
  },
};
