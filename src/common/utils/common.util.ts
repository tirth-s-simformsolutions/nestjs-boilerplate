import { HttpException, InternalServerErrorException } from '@nestjs/common';
import * as sentry from '@sentry/node';
import { ConfigService } from '@nestjs/config';
import { ENV } from '../constants';
import { plainToInstance } from 'class-transformer';
import { EnvVariablesDto } from '../dtos';
import { validateSync } from 'class-validator';

export const isProduction = (configService: ConfigService): boolean =>
  configService.get<string>('app.env') === ENV.PRODUCTION;

export const isDev = (configService: ConfigService): boolean =>
  configService.get<string>('app.env') === ENV.DEV ||
  configService.get<string>('app.env') === ENV.LOCAL;

export const handleError = (error: Error): void => {
  if (error instanceof HttpException) {
    throw new HttpException({ message: error.message }, error.getStatus());
  } else {
    throw new InternalServerErrorException(error);
  }
};

export const captureSentryException = (env: string, error: Error) => {
  if (env === ENV.PRODUCTION || env === ENV.STAGING) {
    sentry.captureException(error);
  }
};

export const validateEnvVariables = (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(EnvVariablesDto, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => Object.values(error.constraints || {}).join(', '))
      .join(', ');
    throw new Error(
      `Environment Variables Validation Failed: ${errorMessages}`,
    );
  }
  return validatedConfig;
};
