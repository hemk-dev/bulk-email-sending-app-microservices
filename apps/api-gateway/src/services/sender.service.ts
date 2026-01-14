import axios from 'axios';
import { logInfo, logError } from '@packages/logger';
import { mapAxiosErrorToException, InternalServerErrorException } from '@packages/errors';
import { SENDER_SERVICE_CONSTANTS } from '../shared/constants/sender-service.constants';
import { TraceContext } from '@packages/tracing';

export const senderService = {
  async createSender(userId: string, data: any) {
    try {
      logInfo('Calling sender service to create sender', { userId });
      
      const traceId = TraceContext.getTraceId();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      };
      
      if (traceId) {
        headers['X-Trace-Id'] = traceId;
      }
      
      const response = await axios.post(
        SENDER_SERVICE_CONSTANTS.ENDPOINTS.CREATE,
        data,
        { headers }
      );

      logInfo('Sender created successfully via sender service', { userId });
      return response.data;
    } catch (error: any) {
      logError('Failed to create sender via sender service', {
        error: error.message,
        userId,
        stack: error.stack,
      });
      
      if (axios.isAxiosError(error)) {
        throw mapAxiosErrorToException(error);
      }
      
      throw new InternalServerErrorException('Failed to create sender. Please try again later!');
    }
  },

  async getSenderById(userId: string, senderId: string) {
    try {
      logInfo('Calling sender service to get sender', { userId, senderId });
      
      const traceId = TraceContext.getTraceId();
      const headers: Record<string, string> = {
        'X-User-Id': userId,
      };
      
      if (traceId) {
        headers['X-Trace-Id'] = traceId;
      }
      
      const response = await axios.get(
        SENDER_SERVICE_CONSTANTS.ENDPOINTS.GET_BY_ID(senderId),
        { headers }
      );

      logInfo('Sender retrieved successfully via sender service', { userId, senderId });
      return response.data;
    } catch (error: any) {
      logError('Failed to get sender via sender service', {
        error: error.message,
        userId,
        senderId,
        stack: error.stack,
      });
      
      if (axios.isAxiosError(error)) {
        throw mapAxiosErrorToException(error);
      }
      
      throw new InternalServerErrorException('Failed to retrieve sender. Please try again later!');
    }
  },

  async getSenders(userId: string, page?: number, limit?: number) {
    try {
      logInfo('Calling sender service to get senders', { userId, page, limit });
      
      const traceId = TraceContext.getTraceId();
      const headers: Record<string, string> = {
        'X-User-Id': userId,
      };
      
      if (traceId) {
        headers['X-Trace-Id'] = traceId;
      }
      
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      
      const url = params.toString() 
        ? `${SENDER_SERVICE_CONSTANTS.ENDPOINTS.GET_ALL}?${params.toString()}`
        : SENDER_SERVICE_CONSTANTS.ENDPOINTS.GET_ALL;
      
      const response = await axios.get(url, { headers });

      logInfo('Senders retrieved successfully via sender service', { userId });
      return response.data;
    } catch (error: any) {
      logError('Failed to get senders via sender service', {
        error: error.message,
        userId,
        stack: error.stack,
      });
      
      if (axios.isAxiosError(error)) {
        throw mapAxiosErrorToException(error);
      }
      
      throw new InternalServerErrorException('Failed to retrieve senders. Please try again later!');
    }
  },

  async updateSender(userId: string, senderId: string, data: any) {
    try {
      logInfo('Calling sender service to update sender', { userId, senderId });
      
      const traceId = TraceContext.getTraceId();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      };
      
      if (traceId) {
        headers['X-Trace-Id'] = traceId;
      }
      
      const response = await axios.put(
        SENDER_SERVICE_CONSTANTS.ENDPOINTS.UPDATE(senderId),
        data,
        { headers }
      );

      logInfo('Sender updated successfully via sender service', { userId, senderId });
      return response.data;
    } catch (error: any) {
      logError('Failed to update sender via sender service', {
        error: error.message,
        userId,
        senderId,
        stack: error.stack,
      });
      
      if (axios.isAxiosError(error)) {
        throw mapAxiosErrorToException(error);
      }
      
      throw new InternalServerErrorException('Failed to update sender. Please try again later!');
    }
  },

  async deleteSender(userId: string, senderId: string) {
    try {
      logInfo('Calling sender service to delete sender', { userId, senderId });
      
      const traceId = TraceContext.getTraceId();
      const headers: Record<string, string> = {
        'X-User-Id': userId,
      };
      
      if (traceId) {
        headers['X-Trace-Id'] = traceId;
      }
      
      const response = await axios.delete(
        SENDER_SERVICE_CONSTANTS.ENDPOINTS.DELETE(senderId),
        { headers }
      );

      logInfo('Sender deleted successfully via sender service', { userId, senderId });
      return response.data;
    } catch (error: any) {
      logError('Failed to delete sender via sender service', {
        error: error.message,
        userId,
        senderId,
        stack: error.stack,
      });
      
      if (axios.isAxiosError(error)) {
        throw mapAxiosErrorToException(error);
      }
      
      throw new InternalServerErrorException('Failed to delete sender. Please try again later!');
    }
  },

  async validateSenderEmail(userId: string, email: string) {
    try {
      logInfo('Calling sender service to validate sender email', { userId, email });
      
      const traceId = TraceContext.getTraceId();
      const headers: Record<string, string> = {
        'X-User-Id': userId,
      };
      
      if (traceId) {
        headers['X-Trace-Id'] = traceId;
      }
      
      const response = await axios.get(
        SENDER_SERVICE_CONSTANTS.ENDPOINTS.VALIDATE_EMAIL,
        { 
          headers,
          params: { email }
        }
      );

      logInfo('Sender email validated successfully via sender service', { userId, email });
      return response.data?.data?.exists || false;
    } catch (error: any) {
      logError('Failed to validate sender email via sender service', {
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
