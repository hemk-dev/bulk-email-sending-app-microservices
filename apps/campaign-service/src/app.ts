import express from 'express';
import { errorHandlerMiddleware } from '@packages/errors';
import { traceMiddleware } from './middlewares/trace.middleware';
import campaignRoute from './routes/campaign.route';
import { createEmailEventConsumer } from './event-consumers/email-event.consumer';
import { createSenderEventConsumer } from './event-consumers/sender-event.consumer';
import { createRecipientEventConsumer } from './event-consumers/recipient-event.consumer';
import { logInfo } from '@packages/logger';

export function createApp() {
  const app = express();
  
  app.use(express.json());
  app.use(traceMiddleware);

  // Health check endpoints
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
  });

  app.get('/ready', (req, res) => {
    res.status(200).json({ status: 'ready' });
  });

  app.use('/campaign', campaignRoute);

  app.use(errorHandlerMiddleware);

  // Initialize event consumers
  try {
    logInfo('Initializing event consumers');
    createEmailEventConsumer();
    createSenderEventConsumer();
    createRecipientEventConsumer();
    logInfo('Event consumers initialized successfully');
  } catch (error: any) {
    logInfo('Failed to initialize event consumers', {
      error: error.message,
      stack: error.stack,
    });
    // Don't crash the app if event consumers fail to start
  }
  
  return app;
}
