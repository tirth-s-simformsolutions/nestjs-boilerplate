import { AsyncLocalStorage } from 'async_hooks';
import { uuid } from './common.util';

interface RequestContext {
  traceId: string;
  startTime: number;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export const asyncContext = {
  run(callback: () => void) {
    const context: RequestContext = {
      traceId: uuid(),
      startTime: Date.now(),
    };
    asyncLocalStorage.run(context, callback);
  },

  getTraceId(): string {
    return asyncLocalStorage.getStore()?.traceId ?? 'unknown-trace';
  },

  getDuration(): number | null {
    const store = asyncLocalStorage.getStore();
    return store ? Date.now() - store.startTime : null;
  },
};
