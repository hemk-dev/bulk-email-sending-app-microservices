import express from 'express';
import { errorHandlerMiddleware } from '@packages/errors';
import { traceMiddleware } from './middlewares/trace.middleware';
import senderRoute from './routes/sender.route';

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

  app.use('/api/senders', senderRoute);

  app.use(errorHandlerMiddleware);
  
  return app;
}
