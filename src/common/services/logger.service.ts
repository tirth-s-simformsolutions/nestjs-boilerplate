import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as winston from 'winston';
import { asyncContext as context } from '../utils';

@Injectable()
export class LoggerService extends Logger {
  private readonly winstonLogger: winston.Logger;

  constructor() {
    super();

    const isProduction = process.env.NODE_ENV === 'production';

    // Ensure logs/ directory exists in production
    if (isProduction) {
      const logDir = path.resolve(process.cwd(), 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
      }
    }

    const transports: winston.transport[] = [];

    // Always log to console (with different formatting for dev/prod)
    transports.push(new winston.transports.Console());

    if (isProduction) {
      // In production, also log to files
      transports.push(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
      );
    }

    this.winstonLogger = winston.createLogger({
      level: isProduction ? 'info' : 'debug',
      format: isProduction
        ? winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          )
        : winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message }) => {
              const traceId = context.getTraceId?.();
              const tracePrefix = traceId ? `[${traceId}] ` : '';
              const msg =
                typeof message === 'string'
                  ? message
                  : JSON.stringify(message, null, 2);
              return `[${timestamp}] ${level}: ${tracePrefix}${msg}`;
            }),
          ),
      transports,
    });
  }

  private formatMessage(
    level: string,
    message: string | Error,
    traceId?: string,
  ) {
    const trace = traceId || context.getTraceId?.();
    const base = {
      timestamp: new Date().toISOString(),
      level,
      traceId: trace,
    };

    if (message instanceof Error) {
      return {
        ...base,
        message: message.message,
        stack: message.stack,
      };
    }

    return {
      ...base,
      message,
    };
  }

  override log(message: string, traceId?: string) {
    const formatted = this.formatMessage('info', message, traceId);
    this.winstonLogger.info(formatted);
  }

  override error(message: string | Error, traceId?: string) {
    const formatted = this.formatMessage('error', message, traceId);
    this.winstonLogger.error(formatted);
  }

  override warn(message: string, traceId?: string) {
    const formatted = this.formatMessage('warn', message, traceId);
    this.winstonLogger.warn(formatted);
  }

  override debug(message: string, traceId?: string) {
    const formatted = this.formatMessage('debug', message, traceId);
    this.winstonLogger.debug(formatted);
  }

  override verbose(message: string, traceId?: string) {
    const formatted = this.formatMessage('verbose', message, traceId);
    this.winstonLogger.verbose(formatted);
  }
}
