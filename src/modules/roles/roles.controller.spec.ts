import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RoleService } from './roles.service';
import { Role } from './entities/role.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionService } from '../permissions/permission.service';
import { Permission } from '../permissions/entities/permission.entity';

describe('RolesController', () => {
  let controller: RolesController;

  const mockPermission: Permission = {
    id: 1,
    name: 'test:permission',
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

  const mockRole: Role = {
    id: 1,
    name: 'Test Role',
    permissions: [mockPermission],
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

  const mockRoleService = {
    create: jest.fn(),
    findManyWithPagination: jest.fn(),
    findOneOrNull: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RoleService,
          useValue: mockRoleService,
        },
        {
          provide: getRepositoryToken(Role),
          useClass: Repository,
        },
        {
          provide: PermissionService,
          useValue: {
            findMany: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRole', () => {
    it('should create a new role', async () => {
      const newRole = {
        name: 'New Role',
        permissions: [1],
      };

      mockRoleService.create.mockResolvedValue({ ...mockRole, ...newRole });

      const result = await controller.createRole();
      const response = await result({ headers: {}, body: newRole });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ...mockRole, ...newRole });
      expect(mockRoleService.create).toHaveBeenCalledWith(newRole);
    });
  });

  describe('getRoles', () => {
    it('should return paginated roles', async () => {
      const query = { page: 1, limit: 10, name: 'test' };
      const expectedResult = {
        items: [mockRole],
        meta: {
          itemCount: 1,
          totalItems: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      };

      mockRoleService.findManyWithPagination.mockResolvedValue(expectedResult);

      const result = await controller.getRoles();
      const response = await result({ headers: {}, query });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedResult);
      expect(mockRoleService.findManyWithPagination).toHaveBeenCalledWith(
        { where: { name: '%test%' } },
        query,
      );
    });
  });

  describe('getRoleDetail', () => {
    it('should return a single role with permissions', async () => {
      mockRoleService.findOneOrNull.mockResolvedValue(mockRole);

      const result = await controller.getRoleDetail();
      const response = await result({ headers: {}, params: { id: 1 } });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRole);
      expect(mockRoleService.findOneOrNull).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['permissions'],
        select: { permissions: { id: true, name: true } },
      });
    });

    it('should throw NotFoundException when role not found', async () => {
      mockRoleService.findOneOrNull.mockResolvedValue(null);

      const result = await controller.getRoleDetail();
      await expect(
        result({ headers: {}, params: { id: 999 } }),
      ).rejects.toThrow('Role not found!');
    });
  });

  describe('updateRole', () => {
    it('should update an existing role', async () => {
      const updateData = {
        name: 'Updated Role',
        permissions: [1],
      };

      mockRoleService.update.mockResolvedValue({ ...mockRole, ...updateData });

      const result = await controller.updateRole();
      const response = await result({
        headers: {},
        params: { id: 1 },
        body: updateData,
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ...mockRole, ...updateData });
      expect(mockRoleService.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('deleteRole', () => {
    it('should delete a role', async () => {
      mockRoleService.delete.mockResolvedValue(undefined);

      const result = await controller.deleteRole();
      const response = await result({ headers: {}, params: { id: 1 } });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Role deleted successfully!' });
      expect(mockRoleService.delete).toHaveBeenCalledWith(1);
    });
  });
});
