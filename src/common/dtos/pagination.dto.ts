import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../constants';
import { VALIDATION_MSG } from '../messages';

export class PaginationDto {
  @ApiPropertyOptional({
    example: 10,
    minimum: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: VALIDATION_MSG.IS_INT('take') })
  @Min(1, { message: VALIDATION_MSG.MIN_VALUE('take', 1) })
  take?: number = DEFAULT_PAGE_SIZE;

  @ApiPropertyOptional({
    example: 0,
    minimum: 0,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: VALIDATION_MSG.IS_INT('skip') })
  @Min(0, { message: VALIDATION_MSG.MIN_VALUE('skip', 0) })
  skip?: number = DEFAULT_PAGE;
}
