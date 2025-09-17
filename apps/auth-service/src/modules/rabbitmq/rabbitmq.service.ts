import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { RABBITMQ_SERVICES } from '@packages/common';
import { catchError, firstValueFrom, retry } from 'rxjs';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(
    @Inject(RABBITMQ_SERVICES.BOOK_SERVICE)
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
   * Publish a message and get response (RPC pattern)
   * This method sends a message to another service and waits for a response
   */
  async publishMessage(
    pattern: string,
    data: Record<string, unknown>,
    timeout = 5000,
  ) {
    this.logger.log(`Publishing message with pattern: ${pattern}`, { data });

    try {
      const response = await firstValueFrom(
        this.rabbitMQClient.send(pattern, data).pipe(
          retry(2),
          catchError((error) => {
            this.logger.error('RPC call failed', {
              pattern,
              error: error.message || error,
              data,
            });

            // If it's already an RPC exception, re-throw it
            if (error instanceof RpcException) {
              this.logger.error('Received RPC Exception from remote service', {
                pattern,
                rpcError: error.getError(),
              });
              throw error;
            }

            // Handle timeout errors
            if (error.name === 'TimeoutError') {
              throw new RpcException({
                status: 'error',
                message: 'Service request timed out',
                code: 'SERVICE_TIMEOUT',
                pattern,
                timeout,
                timestamp: new Date().toISOString(),
              });
            }

            // Handle connection errors
            if (
              error.message?.includes('Connection') ||
              error.code === 'ECONNREFUSED'
            ) {
              throw new RpcException({
                status: 'error',
                message: 'Cannot connect to remote service',
                code: 'SERVICE_UNAVAILABLE',
                pattern,
                originalError: error.message,
                timestamp: new Date().toISOString(),
              });
            }

            // Wrap other errors in RPC exception
            throw new RpcException({
              status: 'error',
              message: 'Failed to communicate with remote service',
              code: 'RPC_COMMUNICATION_ERROR',
              pattern,
              originalError: error.message || error,
              timestamp: new Date().toISOString(),
            });
          }),
        ),
      );

      this.logger.log(`Received response for pattern: ${pattern}`, {
        response,
      });
      return response;
    } catch (error) {
      this.logger.error('RPC call failed with exception', {
        pattern,
        error:
          error instanceof RpcException
            ? error.getError()
            : error.message || error,
        data,
      });

      // Re-throw the exception so it can be handled by the controller
      throw error;
    }
  }

  // /**
  //  * Publish user-related events
  //  */
  // async publishUserEvent() {
  //   const message = {
  //     timestamp: Date.now(),
  //     service: 'auth-service',
  //     message: 'Event from Auth service',
  //     shouldFail: 0,
  //   };

  //   return this.publishMessage(RABBITMQ_EVENTS.BOOK_CREATED, message);
  // }
}
