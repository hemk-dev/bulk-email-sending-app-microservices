import { Request, Response } from 'express';
import { logInfo } from '@packages/logger';
import { asyncHandler } from '@packages/errors';
import { campaignService } from '../services/campaign.service';
import { CreateCampaignDto, UpdateCampaignDto } from '../shared/dto/campaign.dto';

export const campaignController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Campaign creation request received', { userId: req.userId });
    
    const campaignData: CreateCampaignDto = req.body;
    const userId = req.userId!;
    
    const result = await campaignService.createCampaign(userId, campaignData);
    
    res.status(201).json({
      statusCode: 201,
      message: 'Campaign created successfully',
      data: { campaign: result },
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Get campaign request received', { campaignId: req.params.id, userId: req.userId });
    
    const campaignId = req.params.id;
    const userId = req.userId!;
    
    const result = await campaignService.getCampaignById(campaignId, userId);
    
    res.status(200).json({
      statusCode: 200,
      message: 'Campaign fetched successfully',
      data: { campaign: result },
    });
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Get campaigns request received', { userId: req.userId });
    
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const results = await campaignService.getCampaigns(userId, page, limit);
    
    res.status(200).json({
      statusCode: 200,
      message: 'Campaigns fetched successfully',
      data: { campaigns: results },
    });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Campaign update request received', { campaignId: req.params.id, userId: req.userId });
    
    const campaignId = req.params.id;
    const userId = req.userId!;
    const updateData: UpdateCampaignDto = req.body;
    
    const result = await campaignService.updateCampaign(campaignId, userId, updateData);
    
    res.status(200).json({
      statusCode: 200,
      message: 'Campaign updated successfully',
      data: { campaign: result },
    });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Campaign deletion request received', { campaignId: req.params.id, userId: req.userId });
    
    const campaignId = req.params.id;
    const userId = req.userId!;
    
    await campaignService.deleteCampaign(campaignId, userId);
    
    res.status(200).json({
      statusCode: 200,
      message: 'Campaign deleted successfully',
    });
  }),

  prepare: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Campaign preparation request received', { campaignId: req.params.id, userId: req.userId });
    
    const campaignId = req.params.id;
    const userId = req.userId!;
    
    const result = await campaignService.prepareCampaign(campaignId, userId);
    
    res.status(200).json({
      statusCode: 200,
      message: 'Campaign prepared successfully',
      data: { campaign: result },
    });
  }),

  getStatus: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Get campaign status request received', { campaignId: req.params.id, userId: req.userId });
    
    const campaignId = req.params.id;
    const userId = req.userId!;
    
    const result = await campaignService.getCampaignStatus(campaignId, userId);
    
    res.status(200).json({
      statusCode: 200,
      message: 'Campaign status fetched successfully',
      data: { campaign: result },
    });
  }),

  getMetrics: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Get campaign metrics request received', { campaignId: req.params.id, userId: req.userId });
    
    const campaignId = req.params.id;
    const userId = req.userId!;
    
    const result = await campaignService.getCampaignMetrics(campaignId, userId);
    
    res.status(200).json({
      statusCode: 200,
      message: 'Campaign metrics fetched successfully',
      data: { campaign: result },
    });
  }),

  start: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Campaign start request received', { campaignId: req.params.id, userId: req.userId });
    
    const campaignId = req.params.id;
    const userId = req.userId!;
    
    const result = await campaignService.startCampaign(campaignId, userId);
    
    res.status(200).json({
      statusCode: 200,
      message: 'Campaign started successfully',
      data: { campaign: result },
    });
  }),
};
