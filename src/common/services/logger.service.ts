import { Injectable, Logger, LogLevel } from '@nestjs/common';
import { asyncContext as context } from '../utils/asyncContext.util';

const SENSITIVE_KEYS = ['password', 'token', 'authorization'];

function sanitize(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  } else if (obj !== null && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const isSensitive = SENSITIVE_KEYS.some((sensitiveKey) =>
        key.toLowerCase().includes(sensitiveKey),
      );
      sanitized[key] = isSensitive ? '[REDACTED]' : sanitize(value);
    }
    return sanitized;
  }
  return obj;
}

@Injectable()
export class LoggerService extends Logger {
  private readonly isPretty = process.env.PRETTY_LOGS;

  private formatMessage(
    level: LogLevel,
    message: string,
    traceId?: string,
    contextData: Record<string, unknown> = {},
  ): string {
    const timestamp = new Date().toISOString();
    const pid = process.pid;
    const contextId = traceId || context.getTraceId();

    const baseInfo: Record<string, unknown> = {
      timestamp,
      pid,
      level,
      traceId: contextId,
      message,
    };

    // Extra production keys
    const extraProdFields = {
      context: contextData.context,
      method: contextData.method,
      path: contextData.path,
      statusCode: contextData.statusCode,
      durationMs: contextData.durationMs,
      userId: contextData.userId,
      ip: contextData.ip,
      userAgent: contextData.userAgent,
    };

    const isPrettyEnabled = this.isPretty === 'true';

    const finalLog = !isPrettyEnabled
      ? JSON.stringify({ ...baseInfo, ...extraProdFields, ...contextData })
      : this.prettify({ ...baseInfo, ...contextData });

    return finalLog;
  }

  private prettify(log: Record<string, unknown>): string {
    return (
      `[${log.timestamp}] [${String(log.level).toUpperCase()}] [PID:${log.pid}] [${log.traceId}] ${log.message}` +
      (log.stack ? `\nStack: ${log.stack}` : '')
    );
  }

  private stringifyArgs(args: unknown[]): string {
    return args
      .map((arg) => {
        if (arg === undefined) return 'undefined';
        if (typeof arg === 'string') return arg;
        try {
          return JSON.stringify(arg);
        } catch {
          return '[Unserializable]';
        }
      })
      .join(' ');
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    const traceId = context.getTraceId();
    const fullMessage = this.stringifyArgs([message, ...optionalParams]);

    // Get caller information
    const caller = this.getCallerInfo();
    const callerInfo = `${caller.file}`;
    const messageWithCaller = `${fullMessage} - ${callerInfo}`;

    const formatted = this.formatMessage('log', messageWithCaller, traceId);
    super.log(formatted);
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    const traceId = context.getTraceId();
    const fullMessage = this.stringifyArgs([message, ...optionalParams]);

    // Get caller information
    const caller = this.getCallerInfo();
    const callerInfo = `${caller.file} `;
    const messageWithCaller = `${fullMessage} - ${callerInfo}`;

    const formatted = this.formatMessage('warn', messageWithCaller, traceId);
    super.warn(formatted);
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    const traceId = context.getTraceId();
    const fullMessage = this.stringifyArgs([message, ...optionalParams]);

    // Get caller information
    const caller = this.getCallerInfo();
    const callerInfo = `${caller.file}`;
    const messageWithCaller = `${fullMessage} - ${callerInfo}`;

    const formatted = this.formatMessage('debug', messageWithCaller, traceId);
    super.debug(formatted);
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    const traceId = context.getTraceId();
    const fullMessage = this.stringifyArgs([message, ...optionalParams]);

    // Get caller information
    const caller = this.getCallerInfo();
    const callerInfo = `${caller.file}`;
    const messageWithCaller = `${fullMessage} - ${callerInfo}`;

    const formatted = this.formatMessage('verbose', messageWithCaller, traceId);
    super.verbose(formatted);
  }

  error(
    messageParam: unknown,
    stackOrTraceId?: string,
    contextOrData?: string | Record<string, unknown>,
  ): void {
    let traceId = context.getTraceId();
    let stack: string | undefined;
    let contextData: Record<string, unknown> | undefined;
    let message = messageParam;

    if (messageParam instanceof Error) {
      stack = messageParam.stack;
      message = messageParam.message;
    }

    // Get caller information for error logs
    const caller = this.getCallerInfo();
    const callerInfo = `${caller.file}`;

    // Get request information from context
    const requestInfo = context.getRequestInfo();
    let requestDetails = '';
    if (requestInfo.method && requestInfo.originalUrl) {
      requestDetails = ` ${requestInfo.method} ${requestInfo.originalUrl} from ${requestInfo.ip} User-Agent: ${requestInfo.userAgent} server: ${requestInfo.server}`;
    }

    if (typeof contextOrData === 'object') {
      contextData = contextOrData;
      traceId = stackOrTraceId ?? traceId;
    } else {
      stack = stackOrTraceId;
    }

    // Add caller info to the message
    const messageWithCaller = `${message}${requestDetails} - ${callerInfo}`;

    const logEntry = this.formatMessage('error', messageWithCaller, traceId, {
      ...contextData,
      ...(stack && { stack }),
    });

    super.error(logEntry);
  }

  /**
   * Logs HTTP request and response details after sanitizing sensitive data.
   */
  logRequestResponse(requestBody: unknown, traceId?: string): void {
    const sanitizedRequest = sanitize(requestBody);

    const logObj = {
      requestBody: sanitizedRequest,
    };

    const formatted = this.formatMessage(
      'log',
      'HTTP Request-Response Log',
      traceId,
      logObj,
    );

    super.log(formatted);
  }

  private getCallerInfo(): { file: string; line: number; function: string } {
    const originalPrepareStackTrace = Error.prepareStackTrace;
    let callerInfo = { file: 'unknown', line: 0, function: 'unknown' };

    try {
      // Use V8's stack trace API for more reliable results
      Error.prepareStackTrace = (_, stack) => stack;
      const stack = new Error().stack as unknown as NodeJS.CallSite[];
      Error.prepareStackTrace = originalPrepareStackTrace;

      if (!stack || !Array.isArray(stack)) {
        return this.fallbackGetCallerInfo();
      }

      // Files/patterns to skip when looking for the actual caller
      const skipPatterns = [
        'logger.service',
        'trace.middleware',
        'async_hooks',
        'internal/',
        'node_modules/',
        'node:',
        'asyncContext.util',
        'LoggerService',
        'NestApplication',
        'RouterExplorer',
        'ExecutionContextHost',
        'ConsoleLogger',
        'Logger.js',
      ];

      // Start from index 1 to skip the current function
      for (let i = 1; i < stack.length; i++) {
        const callSite = stack[i];
        const fileName = callSite.getFileName();
        const functionName = callSite.getFunctionName() || 'anonymous';
        const lineNumber = callSite.getLineNumber() || 0;

        if (!fileName) {
          continue;
        }

        // Skip if the file matches any skip pattern
        const shouldSkip = skipPatterns.some((pattern) =>
          fileName.includes(pattern),
        );

        if (shouldSkip) {
          continue;
        }

        // Extract just the filename from the full path
        const file = fileName.split('/').pop() || fileName;
        const cleanFile = file.replace(/\.js$/, '.ts');

        callerInfo = {
          file: cleanFile,
          line: lineNumber,
          function: functionName,
        };
        break;
      }
    } catch (error) {
      // Fallback to string parsing if V8 API fails
      return this.fallbackGetCallerInfo();
    }

    return callerInfo;
  }

  private fallbackGetCallerInfo(): {
    file: string;
    line: number;
    function: string;
  } {
    const stack = new Error().stack;
    if (!stack) return { file: 'unknown', line: 0, function: 'unknown' };

    const lines = stack.split('\n');

    // Files to skip when looking for the actual caller
    const filesToSkip = [
      'logger.service',
      'trace.middleware',
      'async_hooks',
      'internal/',
      'node_modules/',
      'node:',
      'asyncContext.util',
      'LoggerService',
      'NestApplication',
      'RouterExplorer',
      'ExecutionContextHost',
      'ConsoleLogger',
      'Logger.js',
    ];

    // Look through the stack to find the first valid caller
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        continue;
      }

      // Skip if the line contains any of the files/paths we want to ignore
      const shouldSkip = filesToSkip.some((skipPattern) =>
        line.includes(skipPattern),
      );

      if (shouldSkip) {
        continue;
      }

      // Try different regex patterns to match various stack trace formats

      // Pattern 1: at ClassName.methodName (/path/to/file.ts:line:column)
      let match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)$/);
      if (match) {
        const [, functionName, filePath, lineNumber] = match;
        if (this.isValidFilePath(filePath)) {
          const file = this.extractFileName(filePath);
          return {
            file,
            line: parseInt(lineNumber, 10),
            function: functionName || 'anonymous',
          };
        }
      }

      // Pattern 2: at /path/to/file.ts:line:column
      match = line.match(/at\s+(.+?):(\d+):(\d+)$/);
      if (match) {
        const [, filePath, lineNumber] = match;
        if (this.isValidFilePath(filePath)) {
          const file = this.extractFileName(filePath);
          return {
            file,
            line: parseInt(lineNumber, 10),
            function: 'unknown',
          };
        }
      }

      // Pattern 3: at Object.<anonymous> (/path/to/file.ts:line:column)
      match = line.match(/at\s+Object\.<anonymous>\s+\((.+?):(\d+):(\d+)\)$/);
      if (match) {
        const [, filePath, lineNumber] = match;
        if (this.isValidFilePath(filePath)) {
          const file = this.extractFileName(filePath);
          return {
            file,
            line: parseInt(lineNumber, 10),
            function: 'anonymous',
          };
        }
      }

      // Pattern 4: at async ClassName.methodName (/path/to/file.ts:line:column)
      match = line.match(/at\s+async\s+(.+?)\s+\((.+?):(\d+):(\d+)\)$/);
      if (match) {
        const [, functionName, filePath, lineNumber] = match;
        if (this.isValidFilePath(filePath)) {
          const file = this.extractFileName(filePath);
          return {
            file,
            line: parseInt(lineNumber, 10),
            function: functionName || 'async',
          };
        }
      }
    }

    return { file: 'unknown', line: 0, function: 'unknown' };
  }

  private isValidFilePath(filePath: string): boolean {
    if (!filePath) return false;

    // Skip internal Node.js files and modules
    const invalidPatterns = [
      'internal/',
      'async_hooks',
      'node_modules/',
      'node:',
      '<anonymous>',
      'native',
    ];

    return !invalidPatterns.some((pattern) => filePath.includes(pattern));
  }

  private extractFileName(filePath: string): string {
    if (!filePath) return 'unknown';

    // Remove any URL-like prefixes
    const cleanPath = filePath.replace(/^file:\/\//, '');

    // Get just the filename
    const fileName = cleanPath.split('/').pop() || cleanPath;

    // Remove .js extension if present (since TypeScript files get compiled to .js)
    return fileName.replace(/\.js$/, '.ts').replace(/\.ts\.ts$/, '.ts');
  }
}
