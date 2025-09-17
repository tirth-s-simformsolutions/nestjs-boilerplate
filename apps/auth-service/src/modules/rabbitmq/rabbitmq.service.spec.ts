// apps/auth-service/src/modules/rabbitmq/rabbitmq.service.test.ts
import { Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { RabbitMQService } from './rabbitmq.service';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
  })),
}));

describe('RabbitMQService', () => {
  let service: RabbitMQService;
  let clientProxyMock: jest.Mocked<ClientProxy>;
  let loggerMock: jest.Mocked<Logger>;

  beforeEach(() => {
    clientProxyMock = {
      connect: jest.fn().mockResolvedValue(undefined),
      send: jest.fn(),
    } as any;

    loggerMock = new Logger() as any;

    service = new RabbitMQService(clientProxyMock);
    (service as any).logger = loggerMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should publish message and return response', async () => {
    const pattern = 'test-pattern';
    const data = { foo: 'bar' };
    const response = { success: true };

    clientProxyMock.send.mockReturnValue(of(response));

    const result = await service.publishMessage(pattern, data);

    expect(clientProxyMock.send).toHaveBeenCalledWith(pattern, data);
    expect(result).toEqual(response);
    expect(loggerMock.log).toHaveBeenCalledWith(
      `Publishing message with pattern: ${pattern}`,
      { data },
    );
    expect(loggerMock.log).toHaveBeenCalledWith(
      `Received response for pattern: ${pattern}`,
      { response },
    );
  });

  it('should retry on failure and succeed', async () => {
    const pattern = 'retry-pattern';
    const data = { foo: 'bar' };
    const response = { retried: true };
    let callCount = 0;

    clientProxyMock.send.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return throwError(() => new Error('fail'));
      return of(response);
    });

    const result = await service.publishMessage(pattern, data);

    expect(callCount).toBeGreaterThan(1);
    expect(result).toEqual(response);
  });

  it('should throw RpcException on TimeoutError', async () => {
    const pattern = 'timeout-pattern';
    const data = {};
    const timeoutError = new Error('Timeout');
    (timeoutError as any).name = 'TimeoutError';

    clientProxyMock.send.mockReturnValue(throwError(() => timeoutError));

    await expect(service.publishMessage(pattern, data)).rejects.toThrow(
      RpcException,
    );
    expect(loggerMock.error).toHaveBeenCalledWith(
      'RPC call failed',
      expect.objectContaining({ pattern, error: 'Timeout', data }),
    );
  });

  it('should throw RpcException on connection error', async () => {
    const pattern = 'conn-pattern';
    const data = {};
    const connError = new Error('Connection refused');
    (connError as any).code = 'ECONNREFUSED';

    clientProxyMock.send.mockReturnValue(throwError(() => connError));

    await expect(service.publishMessage(pattern, data)).rejects.toThrow(
      RpcException,
    );
    expect(loggerMock.error).toHaveBeenCalledWith(
      'RPC call failed',
      expect.objectContaining({ pattern, error: 'Connection refused', data }),
    );
  });

  it('should rethrow RpcException from remote service', async () => {
    const pattern = 'rpc-pattern';
    const data = {};
    const rpcError = new RpcException({ error: 'remote' });

    clientProxyMock.send.mockReturnValue(throwError(() => rpcError));

    await expect(service.publishMessage(pattern, data)).rejects.toThrow(
      RpcException,
    );
    expect(loggerMock.error).toHaveBeenCalledWith(
      'RPC call failed',
      expect.objectContaining({ pattern, error: { error: 'remote' }, data }),
    );
  });

  it('should wrap other errors in RpcException', async () => {
    const pattern = 'other-pattern';
    const data = {};
    const otherError = new Error('Something went wrong');

    clientProxyMock.send.mockReturnValue(throwError(() => otherError));

    await expect(service.publishMessage(pattern, data)).rejects.toThrow(
      RpcException,
    );
    expect(loggerMock.error).toHaveBeenCalledWith(
      'RPC call failed',
      expect.objectContaining({ pattern, error: 'Something went wrong', data }),
    );
  });
});
