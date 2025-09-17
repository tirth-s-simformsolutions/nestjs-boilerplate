import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  ClientProviderOptions,
  ClientsModule,
  Transport,
} from '@nestjs/microservices';
import { RABBITMQ_COMMON_OPTIONS, RABBITMQ_SERVICES } from '@packages/common';
import { RabbitMQListenerService } from './rabbitmq-listener.service';
import { RabbitMQService } from './rabbitmq.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: RABBITMQ_SERVICES.AUTH_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService): ClientProviderOptions => ({
          name: RABBITMQ_SERVICES.AUTH_SERVICE, // client name
          transport: Transport.RMQ,
          options: {
            ...RABBITMQ_COMMON_OPTIONS,
            urls: [configService.get<string>('rabbitmq.connection_uri')],
            queue: RABBITMQ_SERVICES.AUTH_SERVICE,
            exchange: RABBITMQ_SERVICES.BOOK_SERVICE,
            noAck: true,
          },
        }),
      },
    ]),
  ],
  controllers: [RabbitMQListenerService],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
