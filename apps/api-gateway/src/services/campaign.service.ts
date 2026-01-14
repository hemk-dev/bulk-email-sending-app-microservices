import axios from 'axios';
import { logInfo, logError } from '@packages/logger';
import { mapAxiosErrorToException, InternalServerErrorException, BadRequestException } from '@packages/errors';
import { CAMPAIGN_SERVICE_CONSTANTS } from '../shared/constants/campaign-service.constants';
import { senderService } from './sender.service';
import { TraceContext } from '@packages/tracing';

export const campaignService = {
  async createCampaign(userId: string, data: any) {
    try {
      logInfo('Starting campaign creation flow', { userId });
      
      // First, validate senderEmail exists for the user
      if (data.senderEmail) {
        const senderEmail = data.senderEmail.toLowerCase().trim();
        logInfo('Validating sender email before creating campaign', { userId, senderEmail });
        
        try {
          const senderExists = await senderService.validateSenderEmail(userId, senderEmail);
          if (!senderExists) {
            throw new BadRequestException(`Sender email ${senderEmail} does not exist for this user. Please create a sender first.`);
          }
          logInfo('Sender email validated successfully', { userId, senderEmail });
        } catch (error: any) {
          logError('Failed to validate sender email', { error, userId, senderEmail });
          if (error instanceof BadRequestException) {
            throw error;
          }
          throw new BadRequestException(`Failed to validate sender email. Please ensure the sender email exists for your account.`);
        }
      }
      
      // Now call campaign service to create the campaign
      logInfo('Calling campaign service to create campaign', { userId });
      
      const traceId = TraceContext.getTraceId();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      };
      
      if (traceId) {
        headers['X-Trace-Id'] = traceId;
      }
      
      const response = await axios.post(
        CAMPAIGN_SERVICE_CONSTANTS.ENDPOINTS.CREATE,
        data,
        { headers }
      );

      logInfo('Campaign created successfully via campaign service', { userId });
      return response.data;
    } catch (error: any) {
      logError('Failed to create campaign via campaign service', {
        error: error.message,
        userId,
        stack: error.stack,
      });
      
      if (axios.isAxiosError(error)) {
        throw mapAxiosErrorToException(error);
      }
      
      // Re-throw BadRequestException as-is
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to create campaign. Please try again later!');
    }
  },

  async getCampaignById(userId: string, campaignId: string) {
    try {
      logInfo('Calling campaign service to get campaign', { userId, campaignId });
      
      const traceId = TraceContext.getTraceId();
      const headers: Record<string, string> = {
        'X-User-Id': userId,
      };
      
      if (traceId) {
        headers['X-Trace-Id'] = traceId;
      }
      
      const response = await axios.get(
        CAMPAIGN_SERVICE_CONSTANTS.ENDPOINTS.GET_BY_ID(campaignId),
        { headers }
      );

      logInfo('Campaign retrieved successfully via campaign service', { userId, campaignId });
      return response.data;
    } catch (error: any) {
      logError('Failed to get campaign via campaign service', {
        error: error.message,
        userId,
        campaignId,
        stack: error.stack,
      });
      
      if (axios.isAxiosError(error)) {
        throw mapAxiosErrorToException(error);
      }
      
      throw new InternalServerErrorException('Failed to retrieve campaign. Please try again later!');
    }
  },

  async getCampaigns(userId: string, page?: number, limit?: number) {
    try {
      logInfo('Calling campaign service to get campaigns', { userId, page, limit });
      
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
        ? `${CAMPAIGN_SERVICE_CONSTANTS.ENDPOINTS.GET_ALL}?${params.toString()}`
        : CAMPAIGN_SERVICE_CONSTANTS.ENDPOINTS.GET_ALL;
      
      const response = await axios.get(url, { headers });

      logInfo('Campaigns retrieved successfully via campaign service', { userId });
      return response.data;
    } catch (error: any) {
      logError('Failed to get campaigns via campaign service', {
        error: error.message,
        userId,
        stack: error.stack,
      });
      
      if (axios.isAxiosError(error)) {
        throw mapAxiosErrorToException(error);
      }
      
      throw new InternalServerErrorException('Failed to retrieve campaigns. Please try again later!');
    }
  },

  async updateCampaign(userId: string, campaignId: string, data: any) {
    try {
      logInfo('Starting campaign update flow', { userId, campaignId });
      
      // Validate senderEmail if it's being updated
      if (data.senderEmail) {
        const senderEmail = data.senderEmail.toLowerCase().trim();
        logInfo('Validating sender email before updating campaign', { userId, senderEmail });
        
        try {
          const senderExists = await senderService.validateSenderEmail(userId, senderEmail);
          if (!senderExists) {
            throw new BadRequestException(`Sender email ${senderEmail} does not exist for this user. Please create a sender first.`);
          }
          logInfo('Sender email validated successfully during update', { userId, senderEmail });
        } catch (error: any) {
          logError('Failed to validate sender email during update', { error, userId, senderEmail });
          if (error instanceof BadRequestException) {
            throw error;
          }
          throw new BadRequestException(`Failed to validate sender email. Please ensure the sender email exists for your account.`);
        }
      }
      
      // Now call campaign service to update the campaign
      logInfo('Calling campaign service to update campaign', { userId, campaignId });
      
      const traceId = TraceContext.getTraceId();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      };
      
      if (traceId) {
        headers['X-Trace-Id'] = traceId;
      }
      
      const response = await axios.put(
        CAMPAIGN_SERVICE_CONSTANTS.ENDPOINTS.UPDATE(campaignId),
        data,
        { headers }
      );

      logInfo('Campaign updated successfully via campaign service', { userId, campaignId });
      return response.data;
    } catch (error: any) {
      logError('Failed to update campaign via campaign service', {
        error: error.message,
        userId,
        campaignId,
        stack: error.stack,
      });
      
      if (axios.isAxiosError(error)) {
        throw mapAxiosErrorToException(error);
      }
      
      // Re-throw BadRequestException as-is
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to update campaign. Please try again later!');
    }
  },

  async deleteCampaign(userId: string, campaignId: string) {
    try {
      logInfo('Calling campaign service to delete campaign', { userId, campaignId });
      
      const traceId = TraceContext.getTraceId();
      const headers: Record<string, string> = {
        'X-User-Id': userId,
      };
      
      if (traceId) {
        headers['X-Trace-Id'] = traceId;
      }
      
      const response = await axios.delete(
        CAMPAIGN_SERVICE_CONSTANTS.ENDPOINTS.DELETE(campaignId),
        { headers }
      );

      logInfo('Campaign deleted successfully via campaign service', { userId, campaignId });
      return response.data;
    } catch (error: any) {
      logError('Failed to delete campaign via campaign service', {
        error: error.message,
        userId,
        campaignId,
        stack: error.stack,
      });
      
      if (axios.isAxiosError(error)) {
        throw mapAxiosErrorToException(error);
      }
      
      throw new InternalServerErrorException('Failed to delete campaign. Please try again later!');
    }
  },

  async prepareCampaign(userId: string, campaignId: string) {
    try {
      logInfo('Calling campaign service to prepare campaign', { userId, campaignId });
      
      const traceId = TraceContext.getTraceId();
      const headers: Record<string, string> = {
        'X-User-Id': userId,
      };
      
      if (traceId) {
        headers['X-Trace-Id'] = traceId;
      }
      
      const response = await axios.post(
        CAMPAIGN_SERVICE_CONSTANTS.ENDPOINTS.PREPARE(campaignId),
        {},
        { headers }
      );

      logInfo('Campaign prepared successfully via campaign service', { userId, campaignId });
      return response.data;
    } catch (error: any) {
      logError('Failed to prepare campaign via campaign service', {
        error: error.message,
        userId,
        campaignId,
        stack: error.stack,
      });
      
      if (axios.isAxiosError(error)) {
        throw mapAxiosErrorToException(error);
      }
      
      throw new InternalServerErrorException('Failed to prepare campaign. Please try again later!');
    }
  },

  async startCampaign(userId: string, campaignId: string) {
    try {
      logInfo('Calling campaign service to start campaign', { userId, campaignId });
      
      const traceId = TraceContext.getTraceId();
      const headers: Record<string, string> = {
        'X-User-Id': userId,
      };
      
      if (traceId) {
        headers['X-Trace-Id'] = traceId;
      }
      
      const response = await axios.post(
        CAMPAIGN_SERVICE_CONSTANTS.ENDPOINTS.START(campaignId),
        {},
        { headers }
      );

      logInfo('Campaign started successfully via campaign service', { userId, campaignId });
      return response.data;
    } catch (error: any) {
      logError('Failed to start campaign via campaign service', {
        error: error.message,
        userId,
        campaignId,
        stack: error.stack,
      });
      
      if (axios.isAxiosError(error)) {
        throw mapAxiosErrorToException(error);
      }
      
      throw new InternalServerErrorException('Failed to start campaign. Please try again later!');
    }
  },

  async getCampaignStatus(userId: string, campaignId: string) {
    try {
      logInfo('Calling campaign service to get campaign status', { userId, campaignId });
      
      const traceId = TraceContext.getTraceId();
      const headers: Record<string, string> = {
        'X-User-Id': userId,
      };
      
      if (traceId) {
        headers['X-Trace-Id'] = traceId;
      }
      
      const response = await axios.get(
        CAMPAIGN_SERVICE_CONSTANTS.ENDPOINTS.GET_STATUS(campaignId),
        { headers }
      );

      logInfo('Campaign status retrieved successfully via campaign service', { userId, campaignId });
      return response.data;
    } catch (error: any) {
      logError('Failed to get campaign status via campaign service', {
        error: error.message,
        userId,
        campaignId,
        stack: error.stack,
      });
      
      if (axios.isAxiosError(error)) {
        throw mapAxiosErrorToException(error);
      }
      
      throw new InternalServerErrorException('Failed to retrieve campaign status. Please try again later!');
    }
  },

  async getCampaignMetrics(userId: string, campaignId: string) {
    try {
      logInfo('Calling campaign service to get campaign metrics', { userId, campaignId });
      
      const traceId = TraceContext.getTraceId();
      const headers: Record<string, string> = {
        'X-User-Id': userId,
      };
      
      if (traceId) {
        headers['X-Trace-Id'] = traceId;
      }
      
      const response = await axios.get(
        CAMPAIGN_SERVICE_CONSTANTS.ENDPOINTS.GET_METRICS(campaignId),
        { headers }
      );

      logInfo('Campaign metrics retrieved successfully via campaign service', { userId, campaignId });
      return response.data;
    } catch (error: any) {
      logError('Failed to get campaign metrics via campaign service', {
        error: error.message,
        userId,
        campaignId,
        stack: error.stack,
      });
      
      if (axios.isAxiosError(error)) {
        throw mapAxiosErrorToException(error);
      }
      
      throw new InternalServerErrorException('Failed to retrieve campaign metrics. Please try again later!');
    }
  },
};
