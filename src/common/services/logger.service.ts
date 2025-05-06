import { createLogger, format, Logform, Logger, transports } from 'winston';
const { combine, timestamp, printf } = format;

const logDateFormat = 'YYYY-MM-DD HH:mm:ss Z';

const formatLog: () => Logform.Format = () =>
  printf((info): string => {
    const {
      message: logMessage,
      level: logLevel,
      timestamp: logTimestamp,
      ...metadata
    } = info;
    let message: string = '';
    let metadataInfo: string = '';
    if (typeof logMessage === 'string') {
      message = logMessage;
    } else if (
      typeof logMessage === 'object' &&
      Object.keys(logMessage).length > 0
    ) {
      message = JSON.stringify(logMessage);
    }
    if (typeof metadata === 'string') {
      metadataInfo = metadata;
    } else if (
      typeof metadata === 'object' &&
      Object.keys(metadata).length > 0
    ) {
      try {
        metadataInfo = JSON.stringify(metadata);
      } catch (error) {
        // do nothing
      }
    }
    return `${logTimestamp} ${logLevel} ${process.pid} ${message} ${metadataInfo}`;
  });

const formatErrorLog: () => Logform.Format = () =>
  combine(
    format.splat(),
    timestamp({ format: logDateFormat }),
    format.errors({ stack: true }),
    formatLog(),
  );

export const logger: Logger = createLogger({
  level: 'info',
  format: formatErrorLog(),
  exitOnError: false,
  transports: [
    new transports.Console({
      format: combine(
        format.splat(),
        timestamp({ format: logDateFormat }),
        format.errors({ stack: true }),
        format.json(),
        formatLog(),
      ),
    }),
  ],
  // to log unhandled errors
  exceptionHandlers: [
    new transports.Console({
      format: combine(
        format.splat(),
        timestamp({ format: logDateFormat }),
        format.errors({ stack: true }),
        formatLog(),
      ),
    }),
  ],
  rejectionHandlers: [
    new transports.Console({
      format: combine(
        format.colorize(),
        format.splat(),
        timestamp({ format: logDateFormat }),
        format.errors({ stack: true }),
        formatLog(),
      ),
    }),
  ],
});
