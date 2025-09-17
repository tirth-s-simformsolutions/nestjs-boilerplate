import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import {
  AuthGuard,
  commonConfig,
  CommonModule,
  CustomThrottlerGuard,
  HealthModule,
  HttpExceptionsFilter,
  LoggerService,
  PrismaService,
  ResponseInterceptor,
  TraceMiddleware,
} from '@packages/common';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import { join } from 'node:path';
import { validateEnvVariables } from '../common/utils';
import { BooksModule } from './books/books.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [...commonConfig],
      validate: validateEnvVariables,
    }),
    I18nModule.forRootAsync({
      resolvers: [AcceptLanguageResolver],
      useFactory: () => ({
        fallbackLanguage: 'en',
        loaderOptions: { path: join(__dirname, '../../i18n/'), watch: true },
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 1000,
          limit: 10,
        },
      ],
    }),
    HealthModule,
    CommonModule,
    RabbitMQModule,
    BooksModule,
  ],
  controllers: [],
  providers: [
    LoggerService,
    PrismaService,
    ConfigService,
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
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceMiddleware).exclude('/v1/health-check').forRoutes('*');
  }
}
