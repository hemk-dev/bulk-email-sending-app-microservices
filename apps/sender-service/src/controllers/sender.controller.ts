import { Request, Response } from 'express';
import { logInfo } from '@packages/logger';
import { asyncHandler } from '@packages/errors';
import { senderService } from '../services/sender.service';
import { CreateSenderDto, UpdateSenderDto } from '../shared/dto/sender.dto';

export const senderController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Sender creation request received', { userId: req.userId });
    
    const senderData: CreateSenderDto = req.body;
    const userId = req.userId!;
    
    const result = await senderService.createSender(userId, senderData);
    
    res.status(201).json({
      statusCode: 201,
      message: 'Sender created successfully',
      data: { sender: result },
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Get sender request received', { senderId: req.params.id, userId: req.userId });
    
    const senderId = req.params.id;
    const userId = req.userId!;
    
    const result = await senderService.getSenderById(senderId, userId);
    
    res.status(200).json({
      statusCode: 200,
      message: 'Sender fetched successfully',
      data: { sender: result },
    });
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Get senders request received', { userId: req.userId });
    
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const results = await senderService.getSenders(userId, page, limit);
    
    res.status(200).json({
      statusCode: 200,
      message: 'Senders fetched successfully',
      data: { senders: results },
    });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Sender update request received', { senderId: req.params.id, userId: req.userId });
    
    const senderId = req.params.id;
    const userId = req.userId!;
    const updateData: UpdateSenderDto = req.body;
    
    const result = await senderService.updateSender(senderId, userId, updateData);
    
    res.status(200).json({
      statusCode: 200,
      message: 'Sender updated successfully',
      data: { sender: result },
    });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Sender deletion request received', { senderId: req.params.id, userId: req.userId });
    
    const senderId = req.params.id;
    const userId = req.userId!;
    
    await senderService.deleteSender(senderId, userId);
    
    res.status(200).json({
      statusCode: 200,
      message: 'Sender deleted successfully',
    });
  }),

  validateEmail: asyncHandler(async (req: Request, res: Response) => {
    logInfo('Sender email validation request received', { email: req.query.email, userId: req.userId });
    
    const email = req.query.email as string;
    const userId = req.userId!;
    
    if (!email) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Email parameter is required',
      });
    }
    
    const exists = await senderService.validateSenderEmail(email, userId);
    
    res.status(200).json({
      statusCode: 200,
      message: 'Sender email validation completed',
      data: { exists },
    });
  }),
};
