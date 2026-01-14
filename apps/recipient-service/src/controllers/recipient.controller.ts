import { Request, Response } from 'express';
import { logInfo } from '@packages/logger';
import { asyncHandler, BadRequestException } from '@packages/errors';
import { recipientService } from '../services/recipient.service';
import { CreateRecipientDto, BulkCreateRecipientDto } from '../shared/dto/recipient.dto';
import { parseCSV } from '../shared/utils/csv-parser';

export const recipientController = {
  createSingle: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Single recipient creation request received');
    
    const recipientData: CreateRecipientDto = req.body;
    
    const result = await recipientService.createRecipient(recipientData);
    
    res.status(201).json({
      statusCode: 201,
      message: 'Recipient created successfully',
      data: { recipient: result },
    });
  }),

  createBulk: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Bulk recipient creation request received', { 
      contentType: req.headers['content-type'] 
    });

    const contentType = req.headers['content-type'] || '';
    let campaignId: string;
    let recipients: CreateRecipientDto[] = [];

    // Handle JSON format
    if (contentType.includes('application/json')) {
      const bulkData: BulkCreateRecipientDto = req.body;
      
      if (!bulkData.recipients || !Array.isArray(bulkData.recipients)) {
        throw new BadRequestException('recipients array is required');
      }

      campaignId = bulkData.recipients[0]?.campaignId;
      if (!campaignId) {
        throw new BadRequestException('campaignId is required in recipient data');
      }

      // Validate all recipients have the same campaignId
      const allSameCampaign = bulkData.recipients.every(r => r.campaignId === campaignId);
      if (!allSameCampaign) {
        throw new BadRequestException('All recipients must belong to the same campaign');
      }

      recipients = bulkData.recipients;
    }
    // Handle CSV format
    else if (contentType.includes('text/csv') || contentType.includes('multipart/form-data')) {
      campaignId = req.body.campaignId || req.query.campaignId as string;
      
      if (!campaignId) {
        throw new BadRequestException('campaignId is required as query parameter or form field');
      }

      // Get CSV data from file upload or raw body
      let csvData: string | Buffer;
      
      if (req.file) {
        // File uploaded via multer
        csvData = req.file.buffer;
      } else if (req.body && typeof req.body === 'string') {
        // Raw CSV in body
        csvData = req.body;
      } else {
        throw new BadRequestException('CSV data is required');
      }

      const parseResult = await parseCSV(csvData, campaignId);
      
      if (parseResult.errors.length > 0 && parseResult.recipients.length === 0) {
        throw new BadRequestException(`CSV parsing failed: ${parseResult.errors.join('; ')}`);
      }

      recipients = parseResult.recipients;
    } else {
      throw new BadRequestException('Content-Type must be application/json, text/csv, or multipart/form-data');
    }

    const result = await recipientService.bulkCreateRecipients(campaignId, recipients);
    
    res.status(201).json({
      statusCode: 201,
      message: 'Bulk recipient creation completed',
      data: result,
    });
  }),

  getCount: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Get recipient count request received', { campaignId: req.query.campaignId });
    
    const campaignId = req.query.campaignId as string;
    
    if (!campaignId) {
      throw new BadRequestException('campaignId query parameter is required');
    }
    
    const count = await recipientService.getRecipientCount(campaignId);
    
    res.status(200).json({
      statusCode: 200,
      message: 'Recipient count fetched successfully',
      data: { count },
    });
  }),

  getBatch: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Get recipients batch request received', { 
      campaignId: req.query.campaignId,
      limit: req.query.limit,
      offset: req.query.offset,
    });
    
    const campaignId = req.query.campaignId as string;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    
    if (!campaignId) {
      throw new BadRequestException('campaignId query parameter is required');
    }
    
    const result = await recipientService.getRecipientsBatch(campaignId, limit, offset);
    
    res.status(200).json({
      statusCode: 200,
      message: 'Recipients batch fetched successfully',
      data: result,
    });
  }),
};
