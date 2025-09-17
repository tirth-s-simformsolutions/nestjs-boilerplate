import { ApiProperty } from '@nestjs/swagger';
import { CommonResponseDto } from '@packages/common';

export class ChangePasswordResponseDto extends CommonResponseDto {
  @ApiProperty({ example: 'Change password successful' })
  message: string;
}
