import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { EnvVariablesDto1 } from '../dtos';

export const validateEnvVariables1 = (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(EnvVariablesDto1, config, {
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
