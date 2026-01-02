import express from 'express';

export function createApp() {
  const app = express();

  // Core middlewares
  app.use(express.json());

  // Trace must be FIRST
//   app.use(traceMiddleware());

// Logging
//   app.use(requestLogger());

// Routes
//   app.use('/health', healthRouter);

  return app;
}
