import {
  LoginSchema,
  TokenResponseSchema,
  RefreshSchema,
  RefreshTokenBody,
} from './auth.types';
import { z } from 'zod';
import { describe, expect, it } from '@jest/globals';

describe('Auth Types', () => {
  describe('LoginSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = LoginSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = LoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email');
      }
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };

      const result = LoginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Required');
      }
    });
  });

  describe('TokenResponseSchema', () => {
    it('should validate valid token response', () => {
      const validData = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      const result = TokenResponseSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject missing user fields', () => {
      const invalidData = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        user: {
          id: 1,
          // Missing name and email
        },
      };

      const result = TokenResponseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Required');
      }
    });

    it('should reject invalid user email', () => {
      const invalidData = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        user: {
          id: 1,
          name: 'Test User',
          email: 'invalid-email',
        },
      };

      const result = TokenResponseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email');
      }
    });
  });

  describe('RefreshSchema', () => {
    it('should validate valid refresh token', () => {
      const validData = {
        authorization: 'Bearer refresh-token-123',
      };

      const result = RefreshSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject missing authorization header', () => {
      const invalidData = {};

      const result = RefreshSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Required');
      }
    });

    it('should reject empty authorization header', () => {
      const invalidData = {
        authorization: '',
      };

      const result = RefreshSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Required');
      }
    });
  });

  describe('RefreshTokenBody', () => {
    it('should validate valid refresh token body', () => {
      const validData = {
        accessToken: 'access-token-123',
      };

      const result = RefreshTokenBody.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject missing access token', () => {
      const invalidData = {};

      const result = RefreshTokenBody.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Required');
      }
    });

    it('should reject empty access token', () => {
      const invalidData = {
        accessToken: '',
      };

      const result = RefreshTokenBody.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Required');
      }
    });
  });

  describe('Type Inference', () => {
    it('should correctly infer LoginSchema type', () => {
      type LoginType = z.infer<typeof LoginSchema>;
      const login: LoginType = {
        email: 'test@example.com',
        password: 'password123',
      };
      expect(login).toBeDefined();
    });

    it('should correctly infer TokenResponseSchema type', () => {
      type TokenResponseType = z.infer<typeof TokenResponseSchema>;
      const response: TokenResponseType = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
      };
      expect(response).toBeDefined();
    });

    it('should correctly infer RefreshSchema type', () => {
      type RefreshType = z.infer<typeof RefreshSchema>;
      const refresh: RefreshType = {
        authorization: 'Bearer refresh-token-123',
      };
      expect(refresh).toBeDefined();
    });

    it('should correctly infer RefreshTokenBody type', () => {
      type RefreshTokenBodyType = z.infer<typeof RefreshTokenBody>;
      const refreshBody: RefreshTokenBodyType = {
        accessToken: 'access-token-123',
      };
      expect(refreshBody).toBeDefined();
    });
  });
});
