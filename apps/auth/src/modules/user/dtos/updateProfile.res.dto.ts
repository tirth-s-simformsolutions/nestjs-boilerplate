import { ApiProperty } from '@nestjs/swagger';
import { CommonResponseDto } from '@packages/common';

export class UpdateProfileResponseDto extends CommonResponseDto {
  @ApiProperty({ example: 'Profile updated successfully' })
  message: string;
}
