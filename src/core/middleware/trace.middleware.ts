import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as os from 'os';
import { LoggerService } from '../../common/services/logger.service';
import { asyncContext as context } from '../../common/utils/asyncContext.util';

interface User {
  id: string;
  email: string;
  [key: string]: unknown;
}

interface AuthenticatedRequest extends Request {
  user?: User;
}

@Injectable()
export class TraceMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    context.run(() => {
      context.setRequestInfo(
        req.method,
        req.originalUrl,
        req.ip,
        req.headers['user-agent'] || 'unknown',
      );

      const userId = req.user?.id;
      const server = os.hostname();
      const baseMessage = `Request started: ${req.method} ${req.originalUrl} from ${req.ip} User-Agent: ${req.headers['user-agent']} server: ${server}`;

      const extraMetadataParts: string[] = [];
      if (userId) extraMetadataParts.push(`loggerInUserId: ${userId}`);
      if (res?.locals?.processingTimeMs) {
        extraMetadataParts.push(
          `processingTimeMs: ${res.locals.processingTimeMs}`,
        );
      }

      let message = baseMessage;
      if (extraMetadataParts.length > 0) {
        message = `${baseMessage} ${extraMetadataParts.join(' ')}`;
      }

      this.logger.log(message);

      res.on('finish', () => {
        const duration = context.getDuration();
        this.logger.log(
          `Request finished: ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`,
        );
      });

      next();
    });
  }
}
