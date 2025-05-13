import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import * as sentry from '@sentry/node';
import { ConfigService } from '@nestjs/config';
import { ENV } from '../../common/constants';
import { ERROR_MSG } from '../../common/messages';
import { LoggerService } from '../../common/services';

@Catch()
export class HttpExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const i18n = I18nContext.current(host);
    const response = ctx.getResponse<Response>();
    const env = this.configService.get<string>('app.env');

    if (exception instanceof HttpException) {
      if (exception.getStatus() === HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(exception);
        if (env === ENV.PRODUCTION || env === ENV.STAGING) {
          sentry.captureException(exception);
        }
      }
      return this.handleHttpException(exception, response, i18n);
    } else {
      this.logger.error(exception);
      if (env === ENV.PRODUCTION || env === ENV.STAGING) {
        sentry.captureException(exception);
      }
      return this.handleGenericException(response, i18n);
    }
  }

  private handleGenericException(
    res: Response,
    i18n: I18nContext,
  ): Response<string, Record<string, unknown>> {
    return this.sendErrorResponse(
      res,
      HttpStatus.INTERNAL_SERVER_ERROR,
      this.translateErrorMessage(ERROR_MSG.SERVER.INTERNAL_SERVER, i18n),
    );
  }

  private handleHttpException(
    exception: HttpException,
    res: Response,
    i18n: I18nContext,
  ): Response<string, Record<string, unknown>> {
    const errMsg = exception.message;
    const statusCode = exception.getStatus();
    if (
      statusCode === HttpStatus.INTERNAL_SERVER_ERROR &&
      errMsg.toLowerCase().includes('unique constraint')
    ) {
      return this.sendErrorResponse(
        res,
        409,
        this.translateErrorMessage(ERROR_MSG.DB.VALIDATION.UQ_ERROR, i18n),
      );
    }

    if (
      statusCode === HttpStatus.INTERNAL_SERVER_ERROR &&
      errMsg.toLowerCase().includes('foreign key constraint')
    ) {
      return this.sendErrorResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        this.translateErrorMessage(ERROR_MSG.DB.VALIDATION.FK_ERROR, i18n),
      );
    }

    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      return this.sendErrorResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        this.translateErrorMessage(ERROR_MSG.SERVER.INTERNAL_SERVER, i18n),
      );
    }

    if (exception instanceof NotFoundException) {
      return this.sendErrorResponse(
        res,
        HttpStatus.NOT_FOUND,
        this.translateErrorMessage(ERROR_MSG.SERVER.PAGE_NOT_FOUND, i18n) ||
          'Page not found',
      );
    }

    if (exception instanceof BadRequestException) {
      const validationErrors = exception.getResponse() as { message: string[] };
      let translatedErrors: string[] = [];
      if (Array.isArray(validationErrors.message)) {
        translatedErrors = validationErrors.message.map((error) =>
          this.translateErrorMessage(error, i18n),
        );
      } else if (typeof validationErrors.message === 'string') {
        const translatedError = this.translateErrorMessage(
          validationErrors.message,
          i18n,
        );
        translatedErrors.push(translatedError);
      }
      const latestTranslatedError = translatedErrors.reverse()[0];
      return this.sendErrorResponse(
        res,
        exception.getStatus(),
        latestTranslatedError,
      );
    }

    return this.sendErrorResponse(
      res,
      statusCode,
      this.translateErrorMessage(errMsg, i18n),
    );
  }

  private translateErrorMessage(
    errorMessage: string,
    i18n: I18nContext,
  ): string {
    let error = errorMessage;
    const errorMessageArr = errorMessage.split('||');

    if (errorMessageArr.length > 1) {
      error = errorMessageArr[1];
    }

    const [translationKey, argsString] = error.split('|');
    let args;

    try {
      args = argsString ? JSON.parse(argsString) : undefined;
    } catch (error) {
      this.logger.error(error);
      args = undefined;
    }
    return i18n ? i18n?.translate(translationKey, args) : translationKey;
  }

  private sendErrorResponse(
    res: Response,
    statusCode: number,
    message: string,
  ): Response<string, Record<string, unknown>> {
    return res.status(statusCode).json({
      message,
      data: null,
      error: null,
    });
  }
}
