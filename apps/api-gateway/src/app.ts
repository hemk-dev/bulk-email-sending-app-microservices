import express from 'express';
import cors from 'cors';
import { traceMiddleware } from './middlewares/trace.middleware';
import { errorHandlerMiddleware } from '@packages/errors';
import traceRoute from './routes/trace.route';
import authRoute from './routes/auth.route';
import userRoute from './routes/user.route';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use(traceMiddleware);

  app.use('/auth', authRoute);
  app.use('/user', userRoute);
  app.use('/internal', traceRoute);
  app.use(errorHandlerMiddleware);

  return app;
}
