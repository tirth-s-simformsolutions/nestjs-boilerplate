import { HttpException, InternalServerErrorException } from '@nestjs/common';
import * as sentry from '@sentry/node';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { ENV, TIME_UNIT } from '../constants';
import dayjs from './dayjs.util';

export const isProduction = (configService: ConfigService): boolean =>
  configService.get('app.env') === ENV.PRODUCTION;

export const isDev = (configService: ConfigService): boolean =>
  configService.get('app.env') === ENV.DEV ||
  configService.get('app.env') === ENV.LOCAL;

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

export const uuid = () => crypto.randomUUID();

export const twoDateDiff = (
  startDate: Date,
  endDate: Date,
  unit: TIME_UNIT = TIME_UNIT.DAY,
) => {
  const date1 = dayjs(endDate);
  return date1.diff(startDate, unit);
};
