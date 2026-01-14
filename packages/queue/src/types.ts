export interface TraceableJob {
  traceId?: string;
}

/**
 * SMTP Configuration for email sending
 */
export interface SenderSmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  passwordEncrypted: string; // Encrypted SMTP password
}

/**
 * Sender information included in job payload
 */
export interface SenderInfo {
  email: string;
  name: string;
  smtp: SenderSmtpConfig;
}

/**
 * Email job data structure for BullMQ
 */
export interface EmailJobData {
  jobId: string; // UUID for job tracking
  campaignId: string; // Campaign UUID
  recipientId: string; // Recipient UUID
  to: string; // Recipient email address
  subject: string; // Email subject
  html: string; // Email HTML body
  traceId: string; // Distributed tracing ID
  sender: SenderInfo; // Full sender config including SMTP
}