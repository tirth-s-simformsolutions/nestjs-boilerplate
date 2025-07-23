import * as crypto from 'crypto';
import { asyncContext } from './asyncContext.util';

// Mock crypto.randomUUID
jest.mock('crypto', () => ({
  randomUUID: jest.fn(),
}));

describe('AsyncContext Utility', () => {
  const mockCrypto = crypto as jest.Mocked<typeof crypto>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Date.now mock if it exists
    if (jest.isMockFunction(Date.now)) {
      (Date.now as jest.Mock).mockRestore();
    }
  });

  describe('run', () => {
    it('should create and run a context with traceId and startTime', () => {
      const mockTraceId = '123e4567-e89b-12d3-a456-426614174000';
      const mockStartTime = 1640995200000; // Fixed timestamp

      mockCrypto.randomUUID.mockReturnValue(mockTraceId);
      jest.spyOn(Date, 'now').mockReturnValue(mockStartTime);

      const callback = jest.fn();

      asyncContext.run(callback);

      expect(mockCrypto.randomUUID).toHaveBeenCalledTimes(1);
      expect(Date.now).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should make traceId and context available during execution', () => {
      const mockTraceId = '456e7890-e89b-12d3-a456-426614174001';
      mockCrypto.randomUUID.mockReturnValue(mockTraceId);

      let capturedTraceId: string;

      asyncContext.run(() => {
        capturedTraceId = asyncContext.getTraceId();
      });

      expect(capturedTraceId!).toBe(mockTraceId);
    });

    it('should make duration calculation available during execution', () => {
      const mockStartTime = 1640995200000;
      const mockCurrentTime = 1640995201000; // 1 second later

      jest
        .spyOn(Date, 'now')
        .mockReturnValueOnce(mockStartTime) // For context creation
        .mockReturnValueOnce(mockCurrentTime); // For duration calculation

      let capturedDuration: number | null;

      asyncContext.run(() => {
        capturedDuration = asyncContext.getDuration();
      });

      expect(capturedDuration).toBe(1000); // 1 second
    });
  });

  describe('getTraceId', () => {
    it('should return the traceId from current context', () => {
      const mockTraceId = '789e0123-e89b-12d3-a456-426614174002';
      mockCrypto.randomUUID.mockReturnValue(mockTraceId);

      asyncContext.run(() => {
        const traceId = asyncContext.getTraceId();
        expect(traceId).toBe(mockTraceId);
      });
    });

    it('should return "unknown-trace" when no context is available', () => {
      const traceId = asyncContext.getTraceId();
      expect(traceId).toBe('unknown-trace');
    });
  });

  describe('getDuration', () => {
    it('should return the duration when context is available', () => {
      const mockStartTime = 1640995200000;
      const mockCurrentTime = 1640995205000; // 5 seconds later

      jest
        .spyOn(Date, 'now')
        .mockReturnValueOnce(mockStartTime) // For context creation
        .mockReturnValueOnce(mockCurrentTime); // For duration calculation

      asyncContext.run(() => {
        const duration = asyncContext.getDuration();
        expect(duration).toBe(5000); // 5 seconds
      });
    });

    it('should return null when no context is available', () => {
      const duration = asyncContext.getDuration();
      expect(duration).toBeNull();
    });

    it('should return 0 when called immediately after context creation', () => {
      const mockTime = 1640995200000;

      jest.spyOn(Date, 'now').mockReturnValue(mockTime);

      asyncContext.run(() => {
        const duration = asyncContext.getDuration();
        expect(duration).toBe(0);
      });
    });
  });

  describe('nested context behavior', () => {
    it('should handle nested contexts correctly', () => {
      const outerTraceId = 'abc12345-e89b-12d3-a456-426614174003';
      const innerTraceId = 'def67890-e89b-12d3-a456-426614174004';

      mockCrypto.randomUUID
        .mockReturnValueOnce(outerTraceId)
        .mockReturnValueOnce(innerTraceId);

      asyncContext.run(() => {
        const outerTrace = asyncContext.getTraceId();
        expect(outerTrace).toBe(outerTraceId);

        asyncContext.run(() => {
          const innerTrace = asyncContext.getTraceId();
          expect(innerTrace).toBe(innerTraceId);
        });

        // Should return to outer context
        const backToOuter = asyncContext.getTraceId();
        expect(backToOuter).toBe(outerTraceId);
      });
    });
  });

  describe('async behavior', () => {
    it('should maintain context across async operations', async () => {
      const mockTraceId = 'ghi45678-e89b-12d3-a456-426614174005';
      mockCrypto.randomUUID.mockReturnValue(mockTraceId);

      const promise = new Promise<string>((resolve) => {
        asyncContext.run(() => {
          setTimeout(() => {
            const traceId = asyncContext.getTraceId();
            resolve(traceId);
          }, 10);
        });
      });

      const result = await promise;
      expect(result).toBe(mockTraceId);
    });
  });
});
