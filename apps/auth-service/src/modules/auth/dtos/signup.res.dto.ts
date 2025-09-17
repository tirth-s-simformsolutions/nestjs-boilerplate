import { ApiProperty, PickType } from '@nestjs/swagger';
import { CommonResponseDto } from '@packages/common';
import { UserAndTokenDataDto } from './login.res.dto';
export class SignupResponseDto extends PickType(CommonResponseDto, [
  'error',
] as const) {
  @ApiProperty({ example: 'User created successfully' })
  message: string;

  @ApiProperty({ type: UserAndTokenDataDto })
  data: UserAndTokenDataDto;
}
