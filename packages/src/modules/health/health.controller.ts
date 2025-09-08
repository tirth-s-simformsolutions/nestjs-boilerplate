import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { HealthCheckResponseDto, SWAGGER_TAGS } from '../../common';
import { Public } from '../../core';
import { HealthService } from './health.service';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @ApiTags(SWAGGER_TAGS.GENERAL)
  @ApiOperation({
    summary: 'Service Health check API',
    description:
      'This API is used to check health service and database connection',
  })
  @ApiOkResponse({
    description: 'Health check api success',
    type: HealthCheckResponseDto,
  })
  @Public()
  @Get('health-check')
  healthCheck() {
    return this.healthService.check();
  }
}
