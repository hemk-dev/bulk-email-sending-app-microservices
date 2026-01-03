import express from 'express';
import { traceMiddleware } from './middlewares/trace.middleware';
import traceRoute from './routes/trace.route';
export function createApp() {
  const app = express();

  // Core middlewares
  app.use(express.json());

  // Trace must be FIRST
  app.use(traceMiddleware);

// Logging
//   app.use(requestLogger());

// Routes
//   app.use('/health', healthRouter);
  app.use('/internal', traceRoute);

  return app;
}
