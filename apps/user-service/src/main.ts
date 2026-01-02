import { loadConfig } from '@packages/config';
import { logInfo } from '@packages/logger';
import { startServer } from './server';

const config = loadConfig();

logInfo('Bootstrapping User Service', {
  service: config.serviceName,
  env: config.env
});

if (!config.port) {
  throw new Error('PORT is not defined');
}

startServer(config.port);
