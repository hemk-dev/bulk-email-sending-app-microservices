import { v4 as uuid } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { TraceContext } from '@packages/tracing';

export function traceMiddleware(req: Request, res: Response, next: NextFunction) {
  const incomingTraceId = req.headers['x-trace-id'];
  const traceId = typeof incomingTraceId === 'string' ? incomingTraceId : uuid();

  TraceContext.run(traceId, () => {
    res.setHeader('X-Trace-Id', traceId);
    next();
  });
}
