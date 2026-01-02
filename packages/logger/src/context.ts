import { AsyncLocalStorage } from 'node:async_hooks';
import { LogContext } from './types';

export const logContext = new AsyncLocalStorage<LogContext>();

export function getContext(): LogContext {
  return logContext.getStore() || {};
}
