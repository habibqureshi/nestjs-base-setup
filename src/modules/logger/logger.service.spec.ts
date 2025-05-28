import { Test, TestingModule } from '@nestjs/testing';
import { CustomLoggerService } from './logger.service';
import { RequestContext } from 'nestjs-request-context';
import { Logger } from '@nestjs/common';
import { IUser } from 'src/interfaces/user.interface';

// Define types for our mock data
interface MockRequestContext {
  currentContext: {
    req: {
      requestId?: string;
      ip?: string;
      user?: Partial<IUser>;
    };
    res: Record<string, unknown>;
  };
}

// Define type for mock calls
interface MockCall {
  [0]: string;
  [1]?: string;
  [2]?: string;
}

// Mock the RequestContext
jest.mock('nestjs-request-context', () => {
  const mockRequestContext: MockRequestContext = {
    currentContext: {
      req: {
        requestId: 'test-request-id',
        ip: '127.0.0.1',
        user: {
          email: 'test@example.com',
        },
      },
      res: {},
    },
  };
  return { RequestContext: mockRequestContext };
});

describe('CustomLoggerService', () => {
  let service: CustomLoggerService;
  let loggerSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomLoggerService],
    }).compile();

    service = await module.resolve<CustomLoggerService>(CustomLoggerService);
    loggerSpy = jest.spyOn(Logger.prototype, 'log');
    errorSpy = jest.spyOn(Logger.prototype, 'error');
  });

  afterEach(() => {
    loggerSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should log a string message with the correct format', () => {
      const message = 'Test log message';
      service.log(message);

      expect(loggerSpy).toHaveBeenCalled();
      const loggedMessage = (loggerSpy.mock.calls[0] as MockCall)[0];
      expect(loggedMessage).toContain('test-request-id');
      expect(loggedMessage).toContain('127.0.0.1');
      expect(loggedMessage).toContain('test@example.com');
      expect(loggedMessage).toContain(message);
    });

    it('should log an object message with the correct format', () => {
      const message = { key: 'value', nested: { data: 123 } };
      service.log(message);

      expect(loggerSpy).toHaveBeenCalled();
      const loggedMessage = (loggerSpy.mock.calls[0] as MockCall)[0];
      expect(loggedMessage).toContain('test-request-id');
      expect(loggedMessage).toContain('127.0.0.1');
      expect(loggedMessage).toContain('test@example.com');
      expect(loggedMessage).toContain(JSON.stringify(message));
    });

    it('should use fallback values when request properties are missing', () => {
      // Override the mock for this test
      (RequestContext as unknown as MockRequestContext).currentContext = {
        req: {
          requestId: undefined,
          ip: undefined,
          user: undefined,
        },
        res: {},
      };

      const message = 'Test log message';
      service.log(message);

      expect(loggerSpy).toHaveBeenCalled();
      const loggedMessage = (loggerSpy.mock.calls[0] as MockCall)[0];
      expect(loggedMessage).toContain('0'); // requestId fallback
      expect(loggedMessage).toContain('No IP'); // ip fallback
      expect(loggedMessage).toContain('-'); // user email fallback
      expect(loggedMessage).toContain(message);
    });

    it('should include filename and line number in log message', () => {
      const message = 'Test log message';
      service.log(message);

      expect(loggerSpy).toHaveBeenCalled();
      const loggedMessage = (loggerSpy.mock.calls[0] as MockCall)[0];
      // The message should contain the filename and line number in the format: filename : lineNumber
      expect(loggedMessage).toMatch(/logger\.service\.spec\.ts : \d+/);
    });

    it('should handle missing stack trace in log message', () => {
      // Mock Error.prototype.stack to be undefined
      const originalStack = Error.prototype.stack;
      Error.prototype.stack = undefined;

      const message = 'Test log message';
      service.log(message);

      expect(loggerSpy).toHaveBeenCalled();
      const loggedMessage = (loggerSpy.mock.calls[0] as MockCall)[0];
      // Should still log the message even without stack trace
      expect(loggedMessage).toContain(message);

      // Restore original stack
      Error.prototype.stack = originalStack;
    });

    it('should handle malformed stack trace in log message', () => {
      // Mock Error.prototype.stack to return a malformed stack trace
      const originalStack = Error.prototype.stack;
      Error.prototype.stack =
        'Error\n    at Object.<anonymous> (malformed-stack-trace)\n    at processTicksAndRejections';

      const message = 'Test log message';
      service.log(message);

      expect(loggerSpy).toHaveBeenCalled();
      const loggedMessage = (loggerSpy.mock.calls[0] as MockCall)[0];
      // Should still log the message even with malformed stack trace
      expect(loggedMessage).toContain(message);

      // Restore original stack
      Error.prototype.stack = originalStack;
    });

    it('should handle short stack trace in log message', () => {
      // Mock Error.prototype.stack to return a short stack trace
      const originalStack = Error.prototype.stack;
      Error.prototype.stack = 'Error\n    at processTicksAndRejections';

      const message = 'Test log message';
      service.log(message);

      expect(loggerSpy).toHaveBeenCalled();
      const loggedMessage = (loggerSpy.mock.calls[0] as MockCall)[0];
      // Should still log the message even with short stack trace
      expect(loggedMessage).toContain(message);

      // Restore original stack
      Error.prototype.stack = originalStack;
    });

    it('should handle stack trace without filename in log message', () => {
      // Mock Error.prototype.stack to return a stack trace without filename
      const originalStack = Error.prototype.stack;
      Error.prototype.stack =
        'Error\n    at Object.<anonymous> (no-filename-here)\n    at processTicksAndRejections';

      const message = 'Test log message';
      service.log(message);

      expect(loggerSpy).toHaveBeenCalled();
      const loggedMessage = (loggerSpy.mock.calls[0] as MockCall)[0];
      // Should still log the message even without filename in stack trace
      expect(loggedMessage).toContain(message);

      // Restore original stack
      Error.prototype.stack = originalStack;
    });

    it('should handle stack trace without line number in log message', () => {
      // Mock Error.prototype.stack to return a stack trace without line number
      const originalStack = Error.prototype.stack;
      Error.prototype.stack =
        'Error\n    at Object.<anonymous> (filename-without-line)\n    at processTicksAndRejections';

      const message = 'Test log message';
      service.log(message);

      expect(loggerSpy).toHaveBeenCalled();
      const loggedMessage = (loggerSpy.mock.calls[0] as MockCall)[0];
      // Should still log the message even without line number in stack trace
      expect(loggedMessage).toContain(message);

      // Restore original stack
      Error.prototype.stack = originalStack;
    });

    it('should handle stack trace with invalid format in log message', () => {
      // Mock Error.prototype.stack to return a stack trace with invalid format
      const originalStack = Error.prototype.stack;
      Error.prototype.stack =
        'Error\n    at Object.<anonymous> (invalid:format:here)\n    at processTicksAndRejections';

      const message = 'Test log message';
      service.log(message);

      expect(loggerSpy).toHaveBeenCalled();
      const loggedMessage = (loggerSpy.mock.calls[0] as MockCall)[0];
      // Should still log the message even with invalid stack trace format
      expect(loggedMessage).toContain(message);

      // Restore original stack
      Error.prototype.stack = originalStack;
    });
  });

  describe('error', () => {
    it('should log an error message with the correct format', () => {
      const message = 'Test error message';
      const trace = 'Error stack trace';
      const context = 'TestContext';

      service.error(message, trace, context);

      expect(errorSpy).toHaveBeenCalled();
      const loggedMessage = (errorSpy.mock.calls[0] as MockCall)[0];
      expect(loggedMessage).toContain(message);
      expect((errorSpy.mock.calls[0] as MockCall)[1]).toBe(trace);
      expect((errorSpy.mock.calls[0] as MockCall)[2]).toBe(context);
    });

    it('should log an error message without context', () => {
      const message = 'Test error message';
      const trace = 'Error stack trace';

      service.error(message, trace);

      expect(errorSpy).toHaveBeenCalled();
      const loggedMessage = (errorSpy.mock.calls[0] as MockCall)[0];
      expect(loggedMessage).toContain(message);
      expect((errorSpy.mock.calls[0] as MockCall)[1]).toBe(trace);
      expect((errorSpy.mock.calls[0] as MockCall)[2]).toBeUndefined();
    });

    it('should include filename and line number in error message', () => {
      const message = 'Test error message';
      const trace = 'Error stack trace';

      service.error(message, trace);

      expect(errorSpy).toHaveBeenCalled();
      const loggedMessage = (errorSpy.mock.calls[0] as MockCall)[0];
      // The message should contain the filename and line number in the format: [filename:lineNumber]
      expect(loggedMessage).toMatch(/\[logger\.service\.spec\.ts:\d+\]/);
    });

    it('should handle missing stack trace in error message', () => {
      // Mock Error.prototype.stack to be undefined
      const originalStack = Error.prototype.stack;
      Error.prototype.stack = undefined;

      const message = 'Test error message';
      const trace = 'Error stack trace';
      service.error(message, trace);

      expect(errorSpy).toHaveBeenCalled();
      const loggedMessage = (errorSpy.mock.calls[0] as MockCall)[0];
      // Should still log the message even without stack trace
      expect(loggedMessage).toContain(message);

      // Restore original stack
      Error.prototype.stack = originalStack;
    });

    it('should handle malformed stack trace in error message', () => {
      // Mock Error.prototype.stack to return a malformed stack trace
      const originalStack = Error.prototype.stack;
      Error.prototype.stack =
        'Error\n    at Object.<anonymous> (malformed-stack-trace)\n    at processTicksAndRejections';

      const message = 'Test error message';
      const trace = 'Error stack trace';
      service.error(message, trace);

      expect(errorSpy).toHaveBeenCalled();
      const loggedMessage = (errorSpy.mock.calls[0] as MockCall)[0];
      // Should still log the message even with malformed stack trace
      expect(loggedMessage).toContain(message);

      // Restore original stack
      Error.prototype.stack = originalStack;
    });

    it('should handle short stack trace in error message', () => {
      // Mock Error.prototype.stack to return a short stack trace
      const originalStack = Error.prototype.stack;
      Error.prototype.stack = 'Error\n    at processTicksAndRejections';

      const message = 'Test error message';
      const trace = 'Error stack trace';
      service.error(message, trace);

      expect(errorSpy).toHaveBeenCalled();
      const loggedMessage = (errorSpy.mock.calls[0] as MockCall)[0];
      // Should still log the message even with short stack trace
      expect(loggedMessage).toContain(message);

      // Restore original stack
      Error.prototype.stack = originalStack;
    });

    it('should handle stack trace without filename in error message', () => {
      // Mock Error.prototype.stack to return a stack trace without filename
      const originalStack = Error.prototype.stack;
      Error.prototype.stack =
        'Error\n    at Object.<anonymous> (no-filename-here)\n    at processTicksAndRejections';

      const message = 'Test error message';
      const trace = 'Error stack trace';
      service.error(message, trace);

      expect(errorSpy).toHaveBeenCalled();
      const loggedMessage = (errorSpy.mock.calls[0] as MockCall)[0];
      // Should still log the message even without filename in stack trace
      expect(loggedMessage).toContain(message);

      // Restore original stack
      Error.prototype.stack = originalStack;
    });

    it('should handle stack trace without line number in error message', () => {
      // Mock Error.prototype.stack to return a stack trace without line number
      const originalStack = Error.prototype.stack;
      Error.prototype.stack =
        'Error\n    at Object.<anonymous> (filename-without-line)\n    at processTicksAndRejections';

      const message = 'Test error message';
      const trace = 'Error stack trace';
      service.error(message, trace);

      expect(errorSpy).toHaveBeenCalled();
      const loggedMessage = (errorSpy.mock.calls[0] as MockCall)[0];
      // Should still log the message even without line number in stack trace
      expect(loggedMessage).toContain(message);

      // Restore original stack
      Error.prototype.stack = originalStack;
    });

    it('should handle stack trace with invalid format in error message', () => {
      // Mock Error.prototype.stack to return a stack trace with invalid format
      const originalStack = Error.prototype.stack;
      Error.prototype.stack =
        'Error\n    at Object.<anonymous> (invalid:format:here)\n    at processTicksAndRejections';

      const message = 'Test error message';
      const trace = 'Error stack trace';
      service.error(message, trace);

      expect(errorSpy).toHaveBeenCalled();
      const loggedMessage = (errorSpy.mock.calls[0] as MockCall)[0];
      // Should still log the message even with invalid stack trace format
      expect(loggedMessage).toContain(message);

      // Restore original stack
      Error.prototype.stack = originalStack;
    });
  });
});
