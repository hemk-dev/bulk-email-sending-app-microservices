import http from 'http';
import { logInfo } from '@packages/logger';
import { createApp } from './app';

export function startServer(port: number) {
  const app = createApp();
  const server = http.createServer(app);

  server.listen(port, () => {
    logInfo(`User Service listening on port ${port}`);
  });
}
