import { Request, Response } from 'express';
import { logInfo } from '@packages/logger';
import { asyncHandler } from '@packages/errors';
import { senderService } from '../services/sender.service';

export const senderController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Sender creation request received', { userId: req.user?.id });
    
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    const result = await senderService.createSender(userId, req.body);
    res.status(result.statusCode || 201).json(result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Get sender request received', { senderId: req.params.id, userId: req.user?.id });
    
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    const result = await senderService.getSenderById(userId, req.params.id);
    res.status(result.statusCode || 200).json(result);
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Get senders request received', { userId: req.user?.id });
    
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    const page = parseInt(req.query.page as string) || undefined;
    const limit = parseInt(req.query.limit as string) || undefined;
    
    const result = await senderService.getSenders(userId, page, limit);
    res.status(result.statusCode || 200).json(result);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Sender update request received', { senderId: req.params.id, userId: req.user?.id });
    
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    const result = await senderService.updateSender(userId, req.params.id, req.body);
    res.status(result.statusCode || 200).json(result);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Sender deletion request received', { senderId: req.params.id, userId: req.user?.id });
    
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    const result = await senderService.deleteSender(userId, req.params.id);
    res.status(result.statusCode || 200).json(result);
  }),

  validateEmail: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Sender email validation request received (service-to-service)', { email: req.query.email });
    
    // For service-to-service calls, userId comes from X-User-Id header
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(400).json({
        statusCode: 400,
        message: 'X-User-Id header is required for service-to-service calls',
      });
    }
    
    const email = req.query.email as string;
    if (!email) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Email parameter is required',
      });
    }
    
    const exists = await senderService.validateSenderEmail(userId, email);
    res.status(200).json({
      statusCode: 200,
      message: 'Sender email validation completed',
      data: { exists },
    });
  }),
};
