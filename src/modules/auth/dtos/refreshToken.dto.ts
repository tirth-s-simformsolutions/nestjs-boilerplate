import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { VALIDATION_MSG } from 'src/common/messages';

export class RefreshTokenDto {
  @ApiProperty({ example: 'refresh token' })
  @IsString({ message: VALIDATION_MSG.IS_STRING('refreshToken') })
  @IsNotEmpty({ message: VALIDATION_MSG.NOT_EMPTY('refreshToken') })
  refreshToken: string;
}
