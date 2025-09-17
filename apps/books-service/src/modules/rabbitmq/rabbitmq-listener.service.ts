import { Controller, Logger, UseFilters } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException,
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
   * RPC based communication
   * This listener will consume messages from the 'create-book' pattern
   */
  @MessagePattern(RABBITMQ_EVENTS.CREATE_BOOK)
  async handleUserEvents(
    @Payload() message: RabbitMQMessage,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      // Simulate some processing that might fail
      this.logger.log('Processing book created event', {
        pattern: context.getPattern(),
        message,
      });

      // Simulate business logic that throws an error
      const shouldFail = message.shouldFail || false;
      if (shouldFail) {
        throw new RpcException({
          status: 'error',
          message: 'Failed to process book creation',
          code: 'BOOK_PROCESSING_ERROR',
          details: 'This is a test RPC exception from the books service',
          timestamp: new Date().toISOString(),
        });
      }

      this.logger.log('Successfully processed book created event', {
        pattern: context.getPattern(),
        message,
      });

      // Acknowledge the message
      channel.ack(originalMessage);

      return {
        success: true,
        message: 'Book created successfully',
        bookId: `book_${Date.now()}`,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to process book created event', {
        pattern: context.getPattern(),
        error: error.message || error,
        message,
      });

      // Reject the message without requeue (since it's an application error)
      channel.nack(originalMessage, false, false);

      // Re-throw the RPC exception so it's sent back to the caller
      if (error instanceof RpcException) {
        throw error;
      }

      // Wrap other errors in RpcException
      throw new RpcException({
        status: 'error',
        message: 'Unexpected error occurred while processing book',
        code: 'BOOK_PROCESSING_UNEXPECTED_ERROR',
        originalError: error.message || error,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
