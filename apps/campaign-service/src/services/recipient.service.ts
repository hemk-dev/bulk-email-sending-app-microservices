import axios from 'axios';
import { logInfo, logError } from '@packages/logger';
import { loadConfig } from '@packages/config';
import { TraceContext } from '@packages/tracing';
import { mapAxiosErrorToException, InternalServerErrorException } from '@packages/errors';

const config = loadConfig();

/**
 * Recipient Service Client
 * Communicates with Recipient Service via API Gateway
 * All service-to-service communication must go through API Gateway
 */
export const recipientServiceClient = {
  /**
   * Get recipient count for a campaign
   * Calls Recipient Service through API Gateway
   */
  async getRecipientCount(campaignId: string): Promise<number> {
    try {
      logInfo('Calling recipient service via API Gateway to get count', { campaignId });
      
      const traceId = TraceContext.getTraceId();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (traceId) {
        headers['X-Trace-Id'] = traceId;
      }
      
      // Call API Gateway endpoint for recipient count
      // API Gateway will forward to Recipient Service
      const apiGatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:5000';
      const response = await axios.get(
        `${apiGatewayUrl}/recipients/count?campaignId=${campaignId}`,
        { headers }
      );

      const count = response.data?.data?.count || 0;
      logInfo('Recipient count retrieved successfully via API Gateway', { campaignId, count });
      return count;
    } catch (error: any) {
      logError('Failed to get recipient count via API Gateway', {
        error: error.message,
        campaignId,
        stack: error.stack,
      });
      
      if (axios.isAxiosError(error)) {
        throw mapAxiosErrorToException(error);
      }
      
      throw new InternalServerErrorException('Failed to retrieve recipient count. Please try again later!');
    }
  },
};
