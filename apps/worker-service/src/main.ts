import { loadConfig } from '@packages/config';
import { logInfo } from '@packages/logger';

const config = loadConfig();

logInfo('Worker Service Started', {
  service: config.serviceName,
  env: config.env
});

// Worker logic would go here
setInterval(() => {
    logInfo('Worker heartbeat');
}, 60000);
