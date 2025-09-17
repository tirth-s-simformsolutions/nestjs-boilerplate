import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
  JwtService,
];

@Module({
  imports: [DatabaseModule, HealthModule],
  providers: commonServices,
  exports: commonServices,
})
export class CommonModule {}
