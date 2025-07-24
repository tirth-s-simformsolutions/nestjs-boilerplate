import { ApiProperty, PickType } from '@nestjs/swagger';
import { CommonResponseDto } from '../../../common/dtos';

export class RefreshTokenResponseDto extends PickType(CommonResponseDto, [
  'error',
] as const) {
  @ApiProperty({ example: 'Refresh token generated successfully' })
  message: string;

  @ApiProperty()
  data = null;
}
