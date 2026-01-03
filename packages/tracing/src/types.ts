export interface TraceStore {
  traceId: string;
  spanId?: string;
  parentId?: string;
}
