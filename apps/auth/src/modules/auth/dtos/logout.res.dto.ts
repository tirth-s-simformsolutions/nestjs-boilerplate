import { ApiProperty } from '@nestjs/swagger';
import { CommonResponseDto } from '@packages/common';

export class LogoutResponseDto extends CommonResponseDto {
  @ApiProperty({ example: 'Logout successful' })
  message: string;
}
