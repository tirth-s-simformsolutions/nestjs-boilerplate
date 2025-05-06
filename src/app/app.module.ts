import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { join } from 'path';
import { I18nModule, AcceptLanguageResolver } from 'nestjs-i18n';
import { AppController } from './app.controller';
import {
  HttpExceptionsFilter,
  ResponseInterceptor,
} from '../core/interceptors';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../modules/auth/auth.module';
import { AuthGuard } from '../core/guards';
import { UserModule } from '../modules/user/user.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    I18nModule.forRootAsync({
      resolvers: [AcceptLanguageResolver],
      useFactory: () => ({
        fallbackLanguage: 'en',
        loaderOptions: { path: join(__dirname, '../../i18n/'), watch: true },
      }),
    }),
    CommonModule,
    DatabaseModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
