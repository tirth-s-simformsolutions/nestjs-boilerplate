import { AsyncLocalStorage } from 'async_hooks';
import * as crypto from 'crypto';
import * as os from 'os';

interface RequestContext {
  traceId: string;
  userId?: number;
  startTime: number;
  method?: string;
  originalUrl?: string;
  ip?: string;
  userAgent?: string;
  server?: string;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export const asyncContext = {
  run(callback: () => void) {
    const context: RequestContext = {
      traceId: crypto.randomUUID(),
      startTime: Date.now(),
      server: os.hostname(),
    };
    asyncLocalStorage.run(context, callback);
  },

  setRequestInfo(
    method: string,
    originalUrl: string,
    ip: string,
    userAgent: string,
  ) {
    const store = asyncLocalStorage.getStore();
    if (store) {
      store.method = method;
      store.originalUrl = originalUrl;
      store.ip = ip;
      store.userAgent = userAgent;
    }
  },

  getRequestInfo(): {
    method?: string;
    originalUrl?: string;
    ip?: string;
    userAgent?: string;
    server?: string;
  } {
    const store = asyncLocalStorage.getStore();
    return {
      method: store?.method,
      originalUrl: store?.originalUrl,
      ip: store?.ip,
      userAgent: store?.userAgent,
      server: store?.server,
    };
  },

  getTraceId(): string {
    return asyncLocalStorage.getStore()?.traceId ?? 'unknown-trace';
  },

  getDuration(): number | null {
    const store = asyncLocalStorage.getStore();
    return store ? Date.now() - store.startTime : null;
  },
};
