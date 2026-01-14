import { Request, Response } from 'express';
import { logInfo } from '@packages/logger';
import { asyncHandler } from '@packages/errors';
import { campaignService } from '../services/campaign.service';

export const campaignController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Campaign creation request received', { userId: req.user?.id });
    
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    const result = await campaignService.createCampaign(userId, req.body);
    res.status(result.statusCode || 201).json(result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Get campaign request received', { campaignId: req.params.id, userId: req.user?.id });
    
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    const result = await campaignService.getCampaignById(userId, req.params.id);
    res.status(result.statusCode || 200).json(result);
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Get campaigns request received', { userId: req.user?.id });
    
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    const page = parseInt(req.query.page as string) || undefined;
    const limit = parseInt(req.query.limit as string) || undefined;
    
    const result = await campaignService.getCampaigns(userId, page, limit);
    res.status(result.statusCode || 200).json(result);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Campaign update request received', { campaignId: req.params.id, userId: req.user?.id });
    
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    const result = await campaignService.updateCampaign(userId, req.params.id, req.body);
    res.status(result.statusCode || 200).json(result);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Campaign deletion request received', { campaignId: req.params.id, userId: req.user?.id });
    
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    const result = await campaignService.deleteCampaign(userId, req.params.id);
    res.status(result.statusCode || 200).json(result);
  }),

  prepare: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Campaign preparation request received', { campaignId: req.params.id, userId: req.user?.id });
    
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    const result = await campaignService.prepareCampaign(userId, req.params.id);
    res.status(result.statusCode || 200).json(result);
  }),

  start: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Campaign start request received', { campaignId: req.params.id, userId: req.user?.id });
    
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    const result = await campaignService.startCampaign(userId, req.params.id);
    res.status(result.statusCode || 200).json(result);
  }),

  getStatus: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Get campaign status request received', { campaignId: req.params.id, userId: req.user?.id });
    
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    const result = await campaignService.getCampaignStatus(userId, req.params.id);
    res.status(result.statusCode || 200).json(result);
  }),

  getMetrics: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Get campaign metrics request received', { campaignId: req.params.id, userId: req.user?.id });
    
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    const result = await campaignService.getCampaignMetrics(userId, req.params.id);
    res.status(result.statusCode || 200).json(result);
  }),
};
