import { ENV } from '@packages/common';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class EnvVariablesDto1 {
  @IsString()
  @IsIn(Object.values(ENV))
  NODE_ENV: string;

  @IsNumber()
  PORT: number;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsOptional()
  @IsString()
  SENTRY_DSN: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_TOKEN_EXPIRE: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_TOKEN_EXPIRE: string;

  @IsString()
  JWT_ACCESS_SECRET_KEY: string;

  @IsString()
  JWT_REFRESH_SECRET_KEY: string;
}
