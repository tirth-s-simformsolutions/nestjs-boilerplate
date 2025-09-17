import { CommonEnvVariablesDto } from '@packages/common';
import { IsNotEmpty, IsString } from 'class-validator';

export class EnvVariablesDto extends CommonEnvVariablesDto {
  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_TOKEN_EXPIRE: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_TOKEN_EXPIRE: string;

  @IsNotEmpty()
  @IsString()
  JWT_REFRESH_SECRET_KEY: string;
}
