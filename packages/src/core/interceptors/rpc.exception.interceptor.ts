import {
  ArgumentsHost,
  Catch,
  HttpStatus,
  RpcExceptionFilter as RpcExceptionFilterBase,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import * as sentry from '@sentry/node';
import { I18nContext } from 'nestjs-i18n';
import { Observable, throwError } from 'rxjs';
import { ENV } from '../../common/constants';
import { ERROR_MSG } from '../../common/messages';
import { LoggerService } from '../../common/services';

@Catch(RpcException)
export class RpcExceptionFilter
  implements RpcExceptionFilterBase<RpcException>
{
  private readonly configService = new ConfigService();
  private readonly logger = new LoggerService();

  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    const i18n = I18nContext.current(host);
    const env = this.configService.get<string>('app.env');
    const error = exception.getError();

    // Log & capture
    this.logger.error(exception);
    if (env === ENV.PRODUCTION || env === ENV.STAGING) {
      sentry.captureException(exception);
    }

    // Resolve human-readable message
    let message = this.translateErrorMessage(
      typeof error === 'string' ? error : (error as any).message,
      i18n,
    );

    // Map DB constraint errors to friendly messages
    if (
      message?.toLowerCase().includes('unique constraint') ||
      message?.toLowerCase().includes('duplicate key')
    ) {
      message = this.translateErrorMessage(
        ERROR_MSG.DB.VALIDATION.UQ_ERROR,
        i18n,
      );
    }

    if (message?.toLowerCase().includes('foreign key constraint')) {
      message = this.translateErrorMessage(
        ERROR_MSG.DB.VALIDATION.FK_ERROR,
        i18n,
      );
    }

    return throwError(() => ({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      data: null,
      error,
    }));
  }

  private translateErrorMessage(
    errorMessage: string,
    i18n: I18nContext,
  ): string {
    let error = errorMessage || ERROR_MSG.SERVER.INTERNAL_SERVER;
    const errorMessageArr = error.split('||');

    if (errorMessageArr.length > 1) {
      error = errorMessageArr[1];
    }

    const [translationKey, argsString] = error.split('|');
    let args;

    try {
      args = argsString ? JSON.parse(argsString) : undefined;
    } catch (e) {
      this.logger.error(e as Error);
      args = undefined;
    }
    return i18n ? i18n.translate(translationKey, args) : translationKey;
  }
}
