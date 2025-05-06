import { ApiProperty, PickType } from '@nestjs/swagger';
import { CommonResponseDto } from '../../../common/dtos';

class RefreshTokenDataDto {
  @ApiProperty({ example: 'access token' })
  accessToken: string;

  @ApiProperty({ example: 'refresh token' })
  refreshToken: string;
}

export class RefreshTokenResponseDto extends PickType(CommonResponseDto, [
  'error',
] as const) {
  @ApiProperty({ example: 'Refresh token generated successfully' })
  message: string;

  @ApiProperty({ type: RefreshTokenDataDto })
  data: RefreshTokenDataDto;
}
