import {
  PermissionZod,
  CreatePermissionZod,
  UpdatePermissionZod,
  PermissionResponseZod,
  PaginatedPermissionsSchema,
} from './permission.types';

describe('Permission Types', () => {
  const validPermission = {
    id: 1,
    name: 'create:user',
    url: '/api/users',
    regex: '^/api/users$',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
    enable: true,
    deleted: false,
    deletedAt: null,
  };

  describe('PermissionZod', () => {
    it('should validate a valid permission', () => {
      const result = PermissionZod.safeParse(validPermission);
      expect(result.success).toBe(true);
    });

    it('should reject invalid permission', () => {
      const invalidPermission = { ...validPermission, name: 123 };
      const result = PermissionZod.safeParse(invalidPermission);
      expect(result.success).toBe(false);
    });

    it('should reject permission without required fields', () => {
      const invalidPermission = { ...validPermission };
      delete invalidPermission.url;
      const result = PermissionZod.safeParse(invalidPermission);
      expect(result.success).toBe(false);
    });
  });

  describe('CreatePermissionZod', () => {
    it('should validate valid create permission data', () => {
      const createData = {
        name: 'create:user',
        url: '/api/users',
        regex: '^/api/users$',
      };
      const result = CreatePermissionZod.safeParse(createData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid create permission data', () => {
      const invalidData = { name: 123, url: '/api/users' };
      const result = CreatePermissionZod.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject create data without required fields', () => {
      const invalidData = { name: 'create:user' };
      const result = CreatePermissionZod.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdatePermissionZod', () => {
    it('should validate partial update data', () => {
      const updateData = { name: 'update:user' };
      const result = UpdatePermissionZod.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('should validate update with all fields', () => {
      const updateData = {
        name: 'update:user',
        url: '/api/users/update',
        regex: '^/api/users/update$',
      };
      const result = UpdatePermissionZod.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('should validate empty update data', () => {
      const result = UpdatePermissionZod.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('PermissionResponseZod', () => {
    it('should validate permission response', () => {
      const response = {
        data: validPermission,
        message: 'Permission created successfully',
      };
      const result = PermissionResponseZod.safeParse(response);
      expect(result.success).toBe(true);
    });

    it('should reject invalid response', () => {
      const invalidResponse = { data: 'invalid', message: 123 };
      const result = PermissionResponseZod.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should reject response without required fields', () => {
      const invalidResponse = { data: validPermission };
      const result = PermissionResponseZod.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });

  describe('PaginatedPermissionsSchema', () => {
    it('should validate paginated permissions', () => {
      const paginatedData = {
        items: [validPermission],
        meta: {
          itemCount: 1,
          totalItems: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      };
      const result = PaginatedPermissionsSchema.safeParse(paginatedData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid pagination data', () => {
      const invalidData = {
        items: 'invalid',
        meta: { currentPage: 'invalid' },
      };
      const result = PaginatedPermissionsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject pagination data without required fields', () => {
      const invalidData = {
        items: [validPermission],
      };
      const result = PaginatedPermissionsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
