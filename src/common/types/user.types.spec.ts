import { UserZod, CreateUser, PaginatedResponseSchema } from './user.types';
import { z } from 'zod';

describe('User Types', () => {
  describe('UserZod', () => {
    it('should validate valid user data', () => {
      const validData = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        enable: true,
        deleted: false,
      };

      const result = UserZod.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should validate user with roles', () => {
      const validData = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        enable: true,
        deleted: false,
        roles: [{ name: 'admin' }, { name: 'user' }],
      };

      const result = UserZod.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject invalid email', () => {
      const invalidData = {
        id: 1,
        name: 'John Doe',
        email: 'invalid-email',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        enable: true,
        deleted: false,
      };

      const result = UserZod.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email');
      }
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        id: 1,
        // Missing name and email
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        enable: true,
        deleted: false,
      };

      const result = UserZod.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Required');
      }
    });
  });

  describe('CreateUser', () => {
    it('should validate valid create user data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        roles: [1, 2],
      };

      const result = CreateUser.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should validate create user without roles', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = CreateUser.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
      };

      const result = CreateUser.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email');
      }
    });

    it('should reject empty password', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '',
      };

      const result = CreateUser.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Required');
      }
    });
  });

  describe('PaginatedResponseSchema', () => {
    it('should validate valid paginated response', () => {
      const validData = {
        items: [
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
          },
          {
            id: 2,
            name: 'Jane Doe',
            email: 'jane@example.com',
          },
        ],
        meta: {
          itemCount: 2,
          totalItems: 2,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      };

      const result = PaginatedResponseSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should validate empty items array', () => {
      const validData = {
        items: [],
        meta: {
          itemCount: 0,
          totalItems: 0,
          itemsPerPage: 10,
          totalPages: 0,
          currentPage: 1,
        },
      };

      const result = PaginatedResponseSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject invalid meta data', () => {
      const invalidData = {
        items: [
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
          },
        ],
        meta: {
          // Missing required meta fields
          itemCount: 1,
        },
      };

      const result = PaginatedResponseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Required');
      }
    });
  });

  describe('Type Inference', () => {
    it('should infer correct types from UserZod', () => {
      type UserType = z.infer<typeof UserZod>;
      const user: UserType = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        enable: true,
        deleted: false,
      };
      expect(user).toBeDefined();
    });

    it('should infer correct types from CreateUser', () => {
      type CreateUserType = z.infer<typeof CreateUser>;
      const createUser: CreateUserType = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      expect(createUser).toBeDefined();
    });

    it('should infer correct types from PaginatedResponseSchema', () => {
      type PaginatedResponseType = z.infer<typeof PaginatedResponseSchema>;
      const response: PaginatedResponseType = {
        items: [],
        meta: {
          itemCount: 0,
          totalItems: 0,
          itemsPerPage: 10,
          totalPages: 0,
          currentPage: 1,
        },
      };
      expect(response).toBeDefined();
    });
  });
});
