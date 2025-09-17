import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RABBITMQ_EVENTS, RABBITMQ_SERVICES } from '@packages/common';

interface RabbitMQMessage {
  [key: string]: unknown;
}

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(
    @Inject(RABBITMQ_SERVICES.AUTH_SERVICE)
    private readonly rabbitMQClient: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      await this.rabbitMQClient.connect();
      this.logger.log('RabbitMQ client connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  /**
   * Publish a message to a RabbitMQ queue
   * @param pattern - The message pattern/routing key
   * @param message - The message payload
   */
  async publishMessage(pattern: string, message: RabbitMQMessage) {
    try {
      /**
       * `Fire-and-forgate based communication
       * It will not wait for any response from consumer
       */
      const result = await this.rabbitMQClient.emit(pattern, message);

      this.logger.log(`Message published with pattern: ${pattern}`, {
        pattern,
        message,
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to publish message with pattern: ${pattern}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Publish user-related events
   */
  async publishUserEvent() {
    const message = {
      timestamp: Date.now(),
      service: 'book-service',
      message: 'Event from Book Service',
    };
    return this.publishMessage(RABBITMQ_EVENTS.USER_ACTIVATED, message);
  }

  async onModuleDestroy() {
    try {
      await this.rabbitMQClient.close();
      this.logger.log('RabbitMQ client disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting RabbitMQ client:', error);
    }
  }
}
