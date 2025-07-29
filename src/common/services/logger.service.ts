import { Injectable, Logger } from '@nestjs/common';
import { asyncContext as context } from '../utils';

@Injectable()
export class LoggerService extends Logger {
  log(message: string, traceId?: string) {
    super.log(`[${traceId ?? context.getTraceId()}] ${message}`);
  }

  error(message: string | Error, traceId?: string) {
    if (message instanceof Error) {
      super.error(
        `[${traceId ?? context.getTraceId()}] ${message.message}\nStack: ${message.stack}`,
      );
    } else {
      super.error(`[${traceId ?? context.getTraceId()}] ${message}`);
    }
  }

  warn(message: string, traceId?: string) {
    super.warn(`[${traceId ?? context.getTraceId()}] ${message}`);
  }

  debug(message: string, traceId?: string) {
    super.debug(`[${traceId ?? context.getTraceId()}] ${message}`);
  }

  verbose(message: string, traceId?: string) {
    super.verbose(`[${traceId ?? context.getTraceId()}] ${message}`);
  }
}
