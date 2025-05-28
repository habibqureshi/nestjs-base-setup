import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  PreconditionFailedError,
  UnprocessableError,
  InternalError,
  NotImplementedError,
  BadGateWayError,
  SuccessMessage,
} from './error-responses.types';
import { z } from 'zod';

describe('Error Response Types', () => {
  const testErrorResponse = (
    schema: z.ZodType,
    status: number,
    message: string,
    errors: string[],
  ) => {
    it('should validate valid error response', () => {
      const validData = {
        status,
        message,
        errors,
      };

      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        status,
        // Missing message and errors
      };

      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Required');
      }
    });

    it('should reject invalid status code', () => {
      const invalidData = {
        status: 'invalid',
        message,
        errors,
      };

      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Expected number');
      }
    });

    it('should reject non-array errors', () => {
      const invalidData = {
        status,
        message,
        errors: 'not-an-array',
      };

      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Expected array');
      }
    });
  };

  describe('BadRequestError', () => {
    testErrorResponse(BadRequestError, 400, 'BAD_REQUEST', ['invalid email']);
  });

  describe('UnauthorizedError', () => {
    testErrorResponse(UnauthorizedError, 401, 'UNAUTHORIZED', ['unauthorized']);
  });

  describe('ForbiddenError', () => {
    testErrorResponse(ForbiddenError, 403, 'FORBIDDEN', ['forbidden resource']);
  });

  describe('NotFoundError', () => {
    testErrorResponse(NotFoundError, 404, 'NOT_FOUND', ['User not found']);
  });

  describe('ConflictError', () => {
    testErrorResponse(ConflictError, 409, 'CONFLICT', ['resource conflicted']);
  });

  describe('PreconditionFailedError', () => {
    testErrorResponse(PreconditionFailedError, 412, 'PRECONDITION_FAILED', [
      'precondition failed',
    ]);
  });

  describe('UnprocessableError', () => {
    testErrorResponse(UnprocessableError, 422, 'UNPROCESSABLE_ENTITY', [
      'file is required',
    ]);
  });

  describe('InternalError', () => {
    testErrorResponse(InternalError, 500, 'INTERNAL_SERVER_ERROR', [
      'error occurred',
    ]);
  });

  describe('NotImplementedError', () => {
    testErrorResponse(NotImplementedError, 501, 'NOT_IMPLEMENTED', [
      'not implemented',
    ]);
  });

  describe('BadGateWayError', () => {
    testErrorResponse(BadGateWayError, 502, 'BAD_GATEWAY', ['bad gateway']);
  });

  describe('SuccessMessage', () => {
    it('should validate valid success message', () => {
      const validData = {
        message: 'Operation successful',
      };

      const result = SuccessMessage.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject missing message', () => {
      const invalidData = {};

      const result = SuccessMessage.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Required');
      }
    });

    it('should reject non-string message', () => {
      const invalidData = {
        message: 123,
      };

      const result = SuccessMessage.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Expected string');
      }
    });
  });

  describe('Type Inference', () => {
    it('should correctly infer error response types', () => {
      type BadRequestErrorType = z.infer<typeof BadRequestError>;
      const error: BadRequestErrorType = {
        status: 400,
        message: 'BAD_REQUEST',
        errors: ['invalid email'],
      };
      expect(error).toBeDefined();
    });

    it('should correctly infer success message type', () => {
      type SuccessMessageType = z.infer<typeof SuccessMessage>;
      const message: SuccessMessageType = {
        message: 'Operation successful',
      };
      expect(message).toBeDefined();
    });
  });
});
