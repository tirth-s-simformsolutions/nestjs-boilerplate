import { ApiProperty } from '@nestjs/swagger';
import { CommonResponseDto } from './commonResponse.res.dto';

export class HealthCheckResponseDto extends CommonResponseDto {
  @ApiProperty({ example: 'Operation successful' })
  message: string;
}
