import { Controller, Get, Logger, Post, UseFilters } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException,
} from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public, RABBITMQ_EVENTS, RpcExceptionFilter } from '@packages/common';
import { RabbitMQService } from './rabbitmq.service';
interface RabbitMQMessage {
  [key: string]: unknown;
}

@ApiTags('RabbitMQ')
@Controller('rabbitmq')
@UseFilters(new RpcExceptionFilter())
export class RabbitMQController {
  private readonly logger = new Logger(RabbitMQController.name);
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check RabbitMQ connection health' })
  @ApiResponse({ status: 200, description: 'RabbitMQ connection is healthy' })
  async healthCheck() {
    return {
      status: 'ok',
      service: 'rabbitmq',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('publish/user-event')
  @Public()
  @ApiOperation({ summary: 'Publish a user event to Kafka' })
  @ApiResponse({
    status: 201,
    description: 'User event published successfully',
  })
  async publishUserEvent() {
    try {
      await this.rabbitMQService.publishUserEvent();

      return {
        success: true,
        message: 'User event published successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to publish user event',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Handle user events from RabbitMQ
   * RPC based communication
   * This listener will consume messages from the 'book-created' pattern
   */
  @MessagePattern(RABBITMQ_EVENTS.BOOK_CREATED)
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
