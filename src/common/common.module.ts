import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from '../config/app.config';
import databaseConfig from '../config/database.config';
import jwtConfig from '../config/jwt.config';
import { DatabaseModule } from '../database/database.module';
import { HealthService } from './services';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
    }),
    DatabaseModule,
  ],
  providers: [HealthService],
  exports: [HealthService],
})
export class CommonModule {}
