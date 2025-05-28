import { IBaseEntity, PaginationOptions, PaginationMeta } from './common.types';
import { z } from 'zod';

describe('Common Types', () => {
  describe('IBaseEntity', () => {
    it('should validate valid base entity data', () => {
      const validData = {
        id: 1,
        __entity: 'User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        deleted: false,
        enable: true,
      };

      const result = IBaseEntity.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should validate base entity with string dates', () => {
      const validData = {
        id: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        deleted: false,
        enable: true,
      };

      const result = IBaseEntity.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should validate base entity without optional fields', () => {
      const validData = {
        id: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        deleted: false,
        enable: true,
      };

      const result = IBaseEntity.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject invalid date format', () => {
      const invalidData = {
        id: 1,
        createdAt: 'invalid-date',
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        deleted: false,
        enable: true,
      };

      const result = IBaseEntity.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid datetime');
      }
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        id: 1,
        // Missing createdAt and updatedAt
        deletedAt: null,
        deleted: false,
        enable: true,
      };

      const result = IBaseEntity.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid input');
      }
    });
  });

  describe('PaginationOptions', () => {
    it('should validate valid pagination options', () => {
      const validData = {
        limit: 20,
        page: 2,
      };

      const result = PaginationOptions.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should use default values when not provided', () => {
      const result = PaginationOptions.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          limit: 10,
          page: 1,
        });
      }
    });

    it('should coerce string numbers to numbers', () => {
      const validData = {
        limit: '20',
        page: '2',
      };

      const result = PaginationOptions.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          limit: 20,
          page: 2,
        });
      }
    });

    it('should reject invalid number values', () => {
      const invalidData = {
        limit: 'invalid',
        page: 'invalid',
      };

      const result = PaginationOptions.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Expected number, received nan',
        );
      }
    });
  });

  describe('PaginationMeta', () => {
    it('should validate valid pagination meta data', () => {
      const validData = {
        totalItems: 100,
        itemCount: 10,
        itemsPerPage: 10,
        totalPages: 10,
        currentPage: 1,
      };

      const result = PaginationMeta.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        totalItems: 100,
        // Missing other required fields
      };

      const result = PaginationMeta.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Required');
      }
    });

    it('should reject non-number values', () => {
      const invalidData = {
        totalItems: '100',
        itemCount: 10,
        itemsPerPage: 10,
        totalPages: 10,
        currentPage: 1,
      };

      const result = PaginationMeta.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Expected number, received string',
        );
      }
    });
  });

  describe('Type Inference', () => {
    it('should correctly infer IBaseEntity type', () => {
      type BaseEntityType = z.infer<typeof IBaseEntity>;
      const entity: BaseEntityType = {
        id: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        deleted: false,
        enable: true,
      };
      expect(entity).toBeDefined();
    });

    it('should correctly infer PaginationOptions type', () => {
      type PaginationOptionsType = z.infer<typeof PaginationOptions>;
      const options: PaginationOptionsType = {
        limit: 10,
        page: 1,
      };
      expect(options).toBeDefined();
    });

    it('should correctly infer PaginationMeta type', () => {
      type PaginationMetaType = z.infer<typeof PaginationMeta>;
      const meta: PaginationMetaType = {
        totalItems: 100,
        itemCount: 10,
        itemsPerPage: 10,
        totalPages: 10,
        currentPage: 1,
      };
      expect(meta).toBeDefined();
    });
  });
});
