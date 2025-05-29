import { Test, TestingModule } from '@nestjs/testing';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { Permission } from './entities/permission.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('PermissionController', () => {
  let controller: PermissionController;

  const mockPermission: Permission = {
    id: 1,
    name: 'Test Permission',
    url: '/test',
    regex: '^/test$',
    createdAt: new Date(),
    updatedAt: new Date(),
    enable: true,
    deleted: false,
    deletedAt: null,
    setEntityName: jest.fn(),
    hasId: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    softRemove: jest.fn(),
    recover: jest.fn(),
    reload: jest.fn(),
  };

  const mockPermissionService = {
    findManyWithPagination: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionController],
      providers: [
        {
          provide: PermissionService,
          useValue: mockPermissionService,
        },
        {
          provide: getRepositoryToken(Permission),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<PermissionController>(PermissionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPermissions', () => {
    it('should return paginated permissions', async () => {
      const query = { page: 1, limit: 10 };
      const expectedResult = {
        data: [mockPermission],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockPermissionService.findManyWithPagination.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.getPermissions();
      const response = await result({ headers: {}, query });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedResult);
      expect(mockPermissionService.findManyWithPagination).toHaveBeenCalledWith(
        {},
        query,
      );
    });
  });

  describe('getPermission', () => {
    it('should return a single permission', async () => {
      mockPermissionService.findById.mockResolvedValue(mockPermission);

      const result = await controller.getPermission();
      const response = await result({ headers: {}, params: { id: 1 } });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPermission);
      expect(mockPermissionService.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('createPermission', () => {
    it('should create a new permission', async () => {
      const newPermission = {
        name: 'New Permission',
        url: '/new',
        regex: '^/new$',
      };

      mockPermissionService.create.mockResolvedValue({
        ...mockPermission,
        ...newPermission,
      });

      const result = await controller.createPermission();
      const response = await result({
        headers: {},
        body: newPermission,
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ...mockPermission, ...newPermission });
      expect(mockPermissionService.create).toHaveBeenCalledWith(newPermission);
    });
  });

  describe('updatePermission', () => {
    it('should update an existing permission', async () => {
      const updateData = {
        name: 'Updated Permission',
      };

      mockPermissionService.update.mockResolvedValue({
        ...mockPermission,
        ...updateData,
      });

      const result = await controller.updatePermission();
      const response = await result({
        headers: {},
        params: { id: 1 },
        body: updateData,
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ...mockPermission, ...updateData });
      expect(mockPermissionService.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('deletePermission', () => {
    it('should delete a permission', async () => {
      mockPermissionService.delete.mockResolvedValue(undefined);

      const result = await controller.deletePermission();
      const response = await result({ headers: {}, params: { id: 1 } });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Permission deleted successfully',
      });
      expect(mockPermissionService.delete).toHaveBeenCalledWith('1');
    });
  });
});
