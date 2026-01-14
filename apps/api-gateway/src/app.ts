import express from 'express';
import cors from 'cors';
import { traceMiddleware } from './middlewares/trace.middleware';
import { errorHandlerMiddleware } from '@packages/errors';
import authRoute from './routes/auth.route';
import userRoute from './routes/user.route';
import campaignRoute from './routes/campaign.route';
import recipientRoute from './routes/recipient.route';
import senderRoute from './routes/sender.route';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.text({ type: 'text/csv' })); // Support raw CSV body

  app.use(traceMiddleware);

  app.use('/auth', authRoute);
  app.use('/user', userRoute);
  app.use('/campaign', campaignRoute);
  app.use('/recipient', recipientRoute);
  app.use('/sender', senderRoute);
  app.use(errorHandlerMiddleware);

  return app;
}
