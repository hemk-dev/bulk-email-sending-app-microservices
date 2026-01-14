import express from 'express';
import { errorHandlerMiddleware } from '@packages/errors';
import { traceMiddleware } from './middlewares/trace.middleware';
import userRoute from './routes/user.route';

export function createApp() {
  const app = express();
  
  app.use(express.json());
  
  app.use(traceMiddleware);
  
  app.use('/api/user', userRoute);
  
  app.use(errorHandlerMiddleware);
  
  return app;
}
