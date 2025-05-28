import {
  RoleZod,
  CreateRoleZod,
  UpdateRoleZod,
  PaginatedRolesSchema,
  RolesPaginationOpions,
} from './role.types';

describe('Role Types', () => {
  describe('RoleZod', () => {
    it('should validate a valid role object', () => {
      const validRole = {
        id: 1,
        name: 'admin',
        permissions: [
          { id: 1, name: 'create:user' },
          { id: 2, name: 'read:user' },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        enable: true,
        deleted: false,
        deletedAt: null,
      };

      const result = RoleZod.safeParse(validRole);
      expect(result.success).toBe(true);
    });

    it('should reject an invalid role object', () => {
      const invalidRole = {
        id: 'not-a-number',
        name: 123,
        permissions: 'not-an-array',
      };

      const result = RoleZod.safeParse(invalidRole);
      expect(result.success).toBe(false);
    });

    it('should allow role without permissions', () => {
      const roleWithoutPermissions = {
        id: 1,
        name: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        enable: true,
        deleted: false,
        deletedAt: null,
      };

      const result = RoleZod.safeParse(roleWithoutPermissions);
      expect(result.success).toBe(true);
    });
  });

  describe('CreateRoleZod', () => {
    it('should validate a valid create role object', () => {
      const validCreateRole = {
        name: 'admin',
        permissions: [1, 2],
      };

      const result = CreateRoleZod.safeParse(validCreateRole);
      expect(result.success).toBe(true);
    });

    it('should reject an invalid create role object', () => {
      const invalidCreateRole = {
        name: 123,
        permissions: 'not-an-array',
      };

      const result = CreateRoleZod.safeParse(invalidCreateRole);
      expect(result.success).toBe(false);
    });

    it('should allow create role without permissions', () => {
      const createRoleWithoutPermissions = {
        name: 'admin',
      };

      const result = CreateRoleZod.safeParse(createRoleWithoutPermissions);
      expect(result.success).toBe(true);
    });
  });

  describe('UpdateRoleZod', () => {
    it('should validate a valid update role object', () => {
      const validUpdateRole = {
        name: 'updated-admin',
        permissions: [1, 2, 3],
      };

      const result = UpdateRoleZod.safeParse(validUpdateRole);
      expect(result.success).toBe(true);
    });

    it('should allow partial updates', () => {
      const partialUpdate = {
        name: 'updated-admin',
      };

      const result = UpdateRoleZod.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should reject invalid update data', () => {
      const invalidUpdate = {
        name: 123,
        permissions: 'not-an-array',
      };

      const result = UpdateRoleZod.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });

  describe('PaginatedRolesSchema', () => {
    it('should validate a valid paginated roles object', () => {
      const validPaginatedRoles = {
        items: [
          {
            id: 1,
            name: 'admin',
            permissions: [{ id: 1, name: 'create:user' }],
            createdAt: new Date(),
            updatedAt: new Date(),
            enable: true,
            deleted: false,
            deletedAt: null,
          },
        ],
        meta: {
          itemCount: 1,
          totalItems: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      };

      const result = PaginatedRolesSchema.safeParse(validPaginatedRoles);
      expect(result.success).toBe(true);
    });

    it('should reject an invalid paginated roles object', () => {
      const invalidPaginatedRoles = {
        items: 'not-an-array',
        meta: 'not-an-object',
      };

      const result = PaginatedRolesSchema.safeParse(invalidPaginatedRoles);
      expect(result.success).toBe(false);
    });
  });

  describe('RolesPaginationOpions', () => {
    it('should validate valid pagination options', () => {
      const validOptions = {
        page: 1,
        limit: 10,
        name: 'admin',
      };

      const result = RolesPaginationOpions.safeParse(validOptions);
      expect(result.success).toBe(true);
    });

    it('should allow options without name filter', () => {
      const optionsWithoutName = {
        page: 1,
        limit: 10,
      };

      const result = RolesPaginationOpions.safeParse(optionsWithoutName);
      expect(result.success).toBe(true);
    });

    it('should reject invalid pagination options', () => {
      const invalidOptions = {
        page: 'not-a-number',
        limit: 'not-a-number',
        name: 123,
      };

      const result = RolesPaginationOpions.safeParse(invalidOptions);
      expect(result.success).toBe(false);
    });
  });
});
