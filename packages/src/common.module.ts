import { Module } from '@nestjs/common';
import { LoggerService } from './common';
import {
  AuthGuard,
  CustomThrottlerGuard,
  HttpExceptionsFilter,
  ResponseInterceptor,
  TraceMiddleware,
} from './core';
import { DatabaseModule } from './database/database.module';
import { PrismaService } from './database/prisma.service';
import { HealthModule } from './modules/health/health.module';

const commonServices = [
  AuthGuard,
  PrismaService,
  TraceMiddleware,
  LoggerService,
  CustomThrottlerGuard,
  HttpExceptionsFilter,
  ResponseInterceptor,
  HealthModule,
];

@Module({
  imports: [DatabaseModule, HealthModule],
  controllers: [],
  providers: commonServices,
  exports: commonServices,
})
export class CommonModule {}
