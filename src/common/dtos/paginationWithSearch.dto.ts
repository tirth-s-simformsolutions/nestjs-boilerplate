import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { SANITIZED_SEARCH_REGEX } from '../constants';
import { PaginationDto } from './pagination.dto';

export class PaginationWithSearchDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 'test',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    value?.length ? value.replace(SANITIZED_SEARCH_REGEX, '') : '',
  )
  search?: string = '';
}
