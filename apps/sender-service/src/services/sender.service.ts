import { logInfo, logError } from '@packages/logger';
import {
  BadRequestException,
  NotFoundException,
} from '@packages/errors';
import { senderRepository } from '../repositories/sender.repository';
import { Sender, SenderProvider } from '../shared/entities/sender.entity';
import {
  CreateSenderDto,
  UpdateSenderDto,
  SenderResponseDto,
  SenderValidator,
} from '../shared/dto/sender.dto';
import { encryptionUtil } from '../shared/utils/encryption.util';
import { eventPublisherService } from './event-publisher.service';


export const senderService = {
  
  async createSender(userId: string, data: CreateSenderDto): Promise<SenderResponseDto> {
    try {
      logInfo('Starting sender creation', { userId });

      const validation = SenderValidator.validateCreateDto(data);
      if (!validation.valid) {
        throw new BadRequestException(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const encryptedPassword = await encryptionUtil.encrypt(data.smtpPassword);

      const sender = await senderRepository.create({
        userId,
        name: data.name.trim(),
        fromEmail: data.fromEmail.toLowerCase().trim(),
        provider: data.provider || SenderProvider.SMTP,
        smtpHost: data.smtpHost.trim(),
        smtpPort: data.smtpPort,
        smtpUser: data.smtpUser.trim(),
        smtpPassword: encryptedPassword,
        isActive: true,
      });

      logInfo('Sender created successfully', { senderId: sender.id, userId });

      // Emit sender.created event
      await eventPublisherService.publishSenderCreated(sender);

      return SenderValidator.toResponseDto(sender);
    } catch (error: any) {
      logError('Sender creation error', { error, userId });
      throw error;
    }
  },

  async getSenderById(id: string, userId: string): Promise<SenderResponseDto> {
    try {
      logInfo('Starting get sender', { senderId: id, userId });

      const sender = await senderRepository.findById(id, userId);
      if (!sender) {
        throw new NotFoundException('Sender not found');
      }

      logInfo('Sender fetched successfully', { senderId: sender.id, userId });

      return SenderValidator.toResponseDto(sender);
    } catch (error: any) {
      logError('Get sender error', { error, senderId: id, userId });
      throw error;
    }
  },

  async getSenders(userId: string, page: number = 1, limit: number = 10): Promise<SenderResponseDto[]> {
    try {
      logInfo('Starting get senders', { userId, page, limit });

      const offset = (page - 1) * limit;
      const senders = await senderRepository.findByUserId(userId, limit, offset);

      logInfo('Senders fetched successfully', { userId, count: senders.length });

      return senders.map(SenderValidator.toResponseDto);
    } catch (error: any) {
      logError('Get senders error', { error, userId });
      throw error;
    }
  },

  /**
   * Update sender
   */
  async updateSender(id: string, userId: string, data: UpdateSenderDto): Promise<SenderResponseDto> {
    try {
      logInfo('Starting sender update', { senderId: id, userId });

      // Get existing sender
      const sender = await senderRepository.findById(id, userId);
      if (!sender) {
        throw new NotFoundException('Sender not found');
      }

      // Validate input
      const validation = SenderValidator.validateUpdateDto(data);
      if (!validation.valid) {
        throw new BadRequestException(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Prepare updates
      const updates: Partial<Sender> = {};
      if (data.name !== undefined) updates.name = data.name.trim();
      if (data.fromEmail !== undefined) updates.fromEmail = data.fromEmail.toLowerCase().trim();
      if (data.smtpHost !== undefined) updates.smtpHost = data.smtpHost.trim();
      if (data.smtpPort !== undefined) updates.smtpPort = data.smtpPort;
      if (data.smtpUser !== undefined) updates.smtpUser = data.smtpUser.trim();
      if (data.provider !== undefined) updates.provider = data.provider;
      if (data.isActive !== undefined) updates.isActive = data.isActive;

      // Encrypt password if provided
      if (data.smtpPassword !== undefined) {
        updates.smtpPassword = await encryptionUtil.encrypt(data.smtpPassword);
      }

      const updatedSender = await senderRepository.update(id, userId, updates);

      logInfo('Sender updated successfully', { senderId: updatedSender.id, userId });

      // Emit sender.updated event
      await eventPublisherService.publishSenderUpdated(updatedSender);

      return SenderValidator.toResponseDto(updatedSender);
    } catch (error: any) {
      logError('Sender update error', { error, senderId: id, userId });
      throw error;
    }
  },

  /**
   * Delete sender (soft delete - sets isActive=false)
   */
  async deleteSender(id: string, userId: string): Promise<void> {
    try {
      logInfo('Starting sender deletion', { senderId: id, userId });

      // Get existing sender
      const sender = await senderRepository.findById(id, userId);
      if (!sender) {
        throw new NotFoundException('Sender not found');
      }

      await senderRepository.delete(id, userId);

      logInfo('Sender deleted successfully', { senderId: id, userId });
    } catch (error: any) {
      logError('Sender deletion error', { error, senderId: id, userId });
      throw error;
    }
  },

  /**
   * Check if sender email exists for user (for validation)
   */
  async validateSenderEmail(email: string, userId: string): Promise<boolean> {
    try {
      logInfo('Validating sender email', { email, userId });

      const sender = await senderRepository.findByEmailAndUserId(email, userId);
      const exists = sender !== null;

      logInfo('Sender email validation result', { email, userId, exists });
      return exists;
    } catch (error: any) {
      logError('Sender email validation error', { error, email, userId });
      throw error;
    }
  },
};
