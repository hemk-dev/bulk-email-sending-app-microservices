import { AsyncLocalStorage } from 'async_hooks';
import { TraceStore } from './types';

const asyncLocalStorage = new AsyncLocalStorage<TraceStore>();

export const TraceContext = {
  run(traceId: string, fn: () => void) {
    asyncLocalStorage.run({ traceId }, fn);
  },

  getTraceId(): string | undefined {
    return asyncLocalStorage.getStore()?.traceId;
  }
};
