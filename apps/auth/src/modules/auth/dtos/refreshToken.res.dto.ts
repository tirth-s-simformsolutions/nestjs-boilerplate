import { ApiProperty } from '@nestjs/swagger';
import { CommonResponseDto } from '@packages/common';

export class RefreshTokenResponseDto extends CommonResponseDto {
  @ApiProperty({ example: 'Refresh token generated successfully' })
  message: string;
}
