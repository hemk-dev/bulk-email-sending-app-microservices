import axios from 'axios';
import { logInfo, logError } from '@packages/logger';
import { loadConfig } from '@packages/config';
import { TraceContext } from '@packages/tracing';
import { mapAxiosErrorToException, InternalServerErrorException } from '@packages/errors';

const config = loadConfig();

/**
 * Sender Service Client
 * Communicates with Sender Service via API Gateway
 * All service-to-service communication must go through API Gateway
 */
export const senderServiceClient = {
  /**
   * Validate if sender email exists for a user
   * Calls Sender Service through API Gateway
   */
  async validateSenderEmail(userId: string, email: string): Promise<boolean> {
    try {
      logInfo('Calling sender service via API Gateway to validate email', { userId, email });
      
      const traceId = TraceContext.getTraceId();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      };
      
      if (traceId) {
        headers['X-Trace-Id'] = traceId;
      }
      
      const apiGatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:5000';
      const response = await axios.get(
        `${apiGatewayUrl}/senders/validate-email?email=${encodeURIComponent(email)}`,
        { headers }
      );

      const exists = response.data?.data?.exists || false;
      logInfo('Sender email validation completed via API Gateway', { userId, email, exists });
      return exists;
    } catch (error: any) {
      logError('Failed to validate sender email via API Gateway', {
        error: error.message,
        userId,
        email,
        stack: error.stack,
      });
      
      if (axios.isAxiosError(error)) {
        throw mapAxiosErrorToException(error);
      }
      
      throw new InternalServerErrorException('Failed to validate sender email. Please try again later!');
    }
  },
};
