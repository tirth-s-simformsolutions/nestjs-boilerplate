import { Injectable } from '@nestjs/common';
import { SUCCESS_MSG, handleError } from '../../common';
import { ResponseResult } from '../../core';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prismaService: PrismaService) {}

  async check() {
    try {
      // Check database connection
      await this.prismaService.$queryRaw`SELECT 1`;

      return new ResponseResult({
        message: SUCCESS_MSG.OK,
        data: { uptime: process.uptime() },
      });
    } catch (error) {
      handleError(error);
    }
  }
}
