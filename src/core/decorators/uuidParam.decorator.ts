import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { ParseUUIDPipe } from '@nestjs/common/pipes';
import { DEFAULT_UUID_VERSION } from '../../common/constants';
import { VALIDATION_MSG } from '../../common/messages';

export const UUIDParam = (paramName: string) =>
  createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const value = request.params[paramName];

    const pipe = new ParseUUIDPipe({
      version: `${DEFAULT_UUID_VERSION}`,
      exceptionFactory: () =>
        new BadRequestException(VALIDATION_MSG.IS_UUID(paramName)),
    });

    return pipe.transform(value, { type: 'param' });
  })();
