// services/api-gateway/src/server.ts
import http from 'http';
import { createApp } from './app';
import { logTrace } from '@packages/logger';

export function startServer(port: number) {
  const app = createApp();

  const server = http.createServer(app);

  server.listen(port, () => {
    logTrace(`Server listening on port ${port}`);
  });
}
