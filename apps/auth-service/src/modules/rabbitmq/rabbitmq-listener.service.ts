import { Controller, Logger, UseFilters } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { RABBITMQ_EVENTS, RpcExceptionFilter } from '@packages/common';
import { RabbitMQService } from './rabbitmq.service';
interface RabbitMQMessage {
  [key: string]: unknown;
}

@UseFilters(new RpcExceptionFilter())
@Controller()
export class RabbitMQListenerService {
  private readonly logger = new Logger(RabbitMQListenerService.name);
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  /**
   * Handle user events from RabbitMQ
   * This listener will consume messages from the 'user-activated' pattern
   */
  @MessagePattern(RABBITMQ_EVENTS.USER_ACTIVATED)
  async handleUserActivated(
    @Payload() message: RabbitMQMessage,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      this.logger.log('Successfully processed user-activated event', {
        pattern: context.getPattern(),
        message,
      });

      // Acknowledge the message
      channel.ack(originalMessage);
    } catch (error) {
      this.logger.error('Failed to process user event', {
        pattern: context.getPattern(),
        error,
        message,
      });

      // Reject the message and requeue it
      channel.nack(originalMessage, false, true);
      throw error;
    }
  }
}
