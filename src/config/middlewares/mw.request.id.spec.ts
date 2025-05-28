import { RequestIdMiddleware } from './mw.request.id';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('RequestIdMiddleware', () => {
  let middleware: RequestIdMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    middleware = new RequestIdMiddleware();
    mockRequest = {};
    mockResponse = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should generate and attach a request ID', () => {
    // Arrange
    const mockUuid = 'test-uuid-123';
    (uuidv4 as jest.Mock).mockReturnValue(mockUuid);

    // Act
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    // Assert
    expect(mockRequest.requestId).toBe(mockUuid);
    expect(uuidv4).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should call next function', () => {
    // Act
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    // Assert
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should generate unique UUIDs for different requests', () => {
    // Arrange
    const mockUuid1 = 'uuid-1';
    const mockUuid2 = 'uuid-2';
    (uuidv4 as jest.Mock)
      .mockReturnValueOnce(mockUuid1)
      .mockReturnValueOnce(mockUuid2);

    // Act
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
    const request1 = { ...mockRequest };
    middleware.use(request1 as Request, mockResponse as Response, mockNext);

    // Assert
    expect(mockRequest.requestId).toBe(mockUuid1);
    expect(request1.requestId).toBe(mockUuid2);
    expect(uuidv4).toHaveBeenCalledTimes(2);
  });
});
