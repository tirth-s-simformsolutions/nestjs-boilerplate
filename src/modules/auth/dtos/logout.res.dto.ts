import { ApiProperty, PickType } from '@nestjs/swagger';
import { CommonResponseDto } from '../../../common/dtos';

export class LogoutResponseDto extends PickType(CommonResponseDto, [
  'error',
] as const) {
  @ApiProperty({ example: 'Logout successful' })
  message: string;
}
