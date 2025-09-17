import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ENV } from '../constants';

export class CommonEnvVariablesDto {
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

  @IsNotEmpty()
  @IsString()
  JWT_ACCESS_SECRET_KEY: string;

  @IsNotEmpty()
  @IsString()
  RABBITMQ_URL: string;
}
