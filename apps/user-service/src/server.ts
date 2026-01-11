import http from 'http';
import { createApp } from './app.js';
import { logInfo } from '@packages/logger';

export function startServer(port: number) {
  const app = createApp();
  const server = http.createServer(app);

  server.listen(port, () => {
    logInfo(`User Service listening on port ${port}`);
  });
}
