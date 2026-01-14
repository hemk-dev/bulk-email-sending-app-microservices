import { Request, Response } from 'express';
import { logInfo } from '@packages/logger';
import { asyncHandler } from '@packages/errors';
import { recipientService } from '../services/recipient.service';

export const recipientController = {
  createSingle: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Single recipient creation request received');
    
    const result = await recipientService.createSingleRecipient(req.body);
    res.status(result.statusCode || 201).json(result);
  }),

  createBulk: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Bulk recipient creation request received', { 
      contentType: req.headers['content-type'] 
    });
    
    const contentType = req.headers['content-type'] || 'application/json';
    
    // Handle file uploads
    let data: any;
    if (req.file) {
      // For file uploads, we need to forward the file buffer
      // But since we're using axios, we'll need to use FormData
      // For now, pass the body as-is and let the service handle it
      data = req.body;
    } else {
      data = req.body;
    }
    
    const result = await recipientService.createBulkRecipients(data, contentType);
    res.status(result.statusCode || 201).json(result);
  }),

  getCount: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Get recipient count request received', { campaignId: req.query.campaignId });
    
    const campaignId = req.query.campaignId as string;
    if (!campaignId) {
      throw new Error('campaignId query parameter is required');
    }
    
    const result = await recipientService.getRecipientCount(campaignId);
    res.status(result.statusCode || 200).json(result);
  }),

  getBatch: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Get recipients batch request received', { 
      campaignId: req.query.campaignId,
      limit: req.query.limit,
      offset: req.query.offset,
    });
    
    const campaignId = req.query.campaignId as string;
    if (!campaignId) {
      throw new Error('campaignId query parameter is required');
    }
    
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const result = await recipientService.getRecipientsBatch(campaignId, limit, offset);
    res.status(result.statusCode || 200).json(result);
  }),
};
