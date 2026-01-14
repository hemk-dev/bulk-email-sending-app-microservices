import axios from 'axios';
import { logInfo, logError } from '@packages/logger';
import { mapAxiosErrorToException, InternalServerErrorException } from '@packages/errors';
import { RECIPIENT_SERVICE_CONSTANTS } from '../shared/constants/recipient-service.constants';
import { TraceContext } from '@packages/tracing';

export const recipientService = {
  async createSingleRecipient(data: any) {
    try {
      logInfo('Calling recipient service to create single recipient', { campaignId: data.campaignId });
      
      const traceId = TraceContext.getTraceId();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (traceId) {
        headers['X-Trace-Id'] = traceId;
      }
      
      const response = await axios.post(
        RECIPIENT_SERVICE_CONSTANTS.ENDPOINTS.CREATE_SINGLE,
        data,
        { headers }
      );

      logInfo('Recipient created successfully via recipient service');
      return response.data;
    } catch (error: any) {
      logError('Failed to create recipient via recipient service', {
        error: error.message,
        stack: error.stack,
      });
      
      if (axios.isAxiosError(error)) {
        throw mapAxiosErrorToException(error);
      }
      
      throw new InternalServerErrorException('Failed to create recipient. Please try again later!');
    }
  },

  async createBulkRecipients(data: any, contentType?: string) {
    try {
      logInfo('Calling recipient service to create bulk recipients', { contentType });
      
      const traceId = TraceContext.getTraceId();
      const headers: Record<string, string> = {};
      
      if (contentType) {
        headers['Content-Type'] = contentType;
      }
      
      if (traceId) {
        headers['X-Trace-Id'] = traceId;
      }
      
      const response = await axios.post(
        RECIPIENT_SERVICE_CONSTANTS.ENDPOINTS.CREATE_BULK,
        data,
        { headers }
      );

      logInfo('Bulk recipients created successfully via recipient service');
      return response.data;
    } catch (error: any) {
      logError('Failed to create bulk recipients via recipient service', {
        error: error.message,
        stack: error.stack,
      });
      
      if (axios.isAxiosError(error)) {
        throw mapAxiosErrorToException(error);
      }
      
      throw new InternalServerErrorException('Failed to create bulk recipients. Please try again later!');
    }
  },

  async getRecipientCount(campaignId: string) {
    try {
      logInfo('Calling recipient service to get recipient count', { campaignId });
      
      const traceId = TraceContext.getTraceId();
      const headers: Record<string, string> = {};
      
      if (traceId) {
        headers['X-Trace-Id'] = traceId;
      }
      
      const response = await axios.get(
        RECIPIENT_SERVICE_CONSTANTS.ENDPOINTS.GET_COUNT(campaignId),
        { headers }
      );

      logInfo('Recipient count retrieved successfully via recipient service', { campaignId });
      return response.data;
    } catch (error: any) {
      logError('Failed to get recipient count via recipient service', {
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

  async getRecipientsBatch(campaignId: string, limit: number = 100, offset: number = 0) {
    try {
      logInfo('Calling recipient service to get recipients batch', { campaignId, limit, offset });
      
      const traceId = TraceContext.getTraceId();
      const headers: Record<string, string> = {};
      
      if (traceId) {
        headers['X-Trace-Id'] = traceId;
      }
      
      const response = await axios.get(
        RECIPIENT_SERVICE_CONSTANTS.ENDPOINTS.GET_BATCH(campaignId, limit, offset),
        { headers }
      );

      logInfo('Recipients batch retrieved successfully via recipient service', { campaignId });
      return response.data;
    } catch (error: any) {
      logError('Failed to get recipients batch via recipient service', {
        error: error.message,
        campaignId,
        stack: error.stack,
      });
      
      if (axios.isAxiosError(error)) {
        throw mapAxiosErrorToException(error);
      }
      
      throw new InternalServerErrorException('Failed to retrieve recipients batch. Please try again later!');
    }
  },
};
