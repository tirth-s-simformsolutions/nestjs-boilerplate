import { ApiProperty, PickType } from '@nestjs/swagger';
import { CommonResponseDto } from '@packages/common';
import { UserInfoDto } from '../../auth/dtos';

export class GetProfileResponseDto extends PickType(CommonResponseDto, [
  'error',
] as const) {
  @ApiProperty({ example: 'Profile fetched successfully' })
  message: string;

  @ApiProperty({ type: UserInfoDto })
  data: UserInfoDto;
}
