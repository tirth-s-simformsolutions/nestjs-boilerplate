import { Module } from '@nestjs/common';
import { DatabaseModule } from 'packages/src/database/database.module';
import { PrismaService } from '../../database/prisma.service';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HealthController],
  providers: [HealthService, PrismaService],
})
export class HealthModule {}
