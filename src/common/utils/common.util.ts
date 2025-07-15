import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { EnvVariablesDto } from '../dtos';

export const handleError = (error: Error): void => {
  if (error instanceof HttpException) {
    throw new HttpException({ message: error.message }, error.getStatus());
  } else {
    throw new InternalServerErrorException(error);
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
