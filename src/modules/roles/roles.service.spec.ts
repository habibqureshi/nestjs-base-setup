import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './roles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UpdateResult, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { PermissionService } from '../permissions/permission.service';
import { Permission } from '../permissions/entities/permission.entity';
import { NotFoundException } from '@nestjs/common';

describe('RoleService', () => {
  let service: RoleService;

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

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockPermissionService = {
    findMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: getRepositoryToken(Role),
          useValue: mockRepository,
        },
        {
          provide: PermissionService,
          useValue: mockPermissionService,
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);

    // Reset all mocks
    jest.clearAllMocks();

    // Mock BaseService methods
    jest
      .spyOn(service, 'save')
      .mockImplementation((role: Role) => Promise.resolve(role as Role));
    jest
      .spyOn(service, 'softDeleteById')
      .mockImplementation((_) =>
        Promise.resolve({ affected: 1, raw: [], generatedMaps: [] }),
      );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new role with permissions', async () => {
      const newRole = {
        name: 'New Role',
        permissions: [1],
      };

      const roleWithPermissions = {
        id: 1,
        name: newRole.name,
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

      mockPermissionService.findMany.mockResolvedValue([mockPermission]);
      jest.spyOn(service, 'save').mockResolvedValue(roleWithPermissions);

      const result = await service.create(newRole);

      expect(result).toEqual(roleWithPermissions);
      expect(mockPermissionService.findMany).toHaveBeenCalledWith({
        where: { id: In([1]) },
      });
      expect(service.save).toHaveBeenCalledWith({
        name: newRole.name,
        permissions: [mockPermission],
      });
    });

    it('should create a role without permissions', async () => {
      const newRole = {
        name: 'New Role',
        permissions: [],
      };

      const roleWithoutPermissions = {
        id: 1,
        name: newRole.name,
        permissions: [],
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

      jest.spyOn(service, 'save').mockResolvedValue(roleWithoutPermissions);

      const result = await service.create(newRole);
      expect(result).toEqual(roleWithoutPermissions);
      expect(mockPermissionService.findMany).not.toHaveBeenCalled();
      expect(service.save).toHaveBeenCalledWith({
        name: newRole.name,
        permissions: [],
      });
    });
  });

  describe('update', () => {
    it('should update a role with new permissions', async () => {
      const updateData = {
        name: 'Updated Role',
        permissions: [1],
      };

      const updatedRole = {
        ...mockRole,
        ...updateData,
        permissions: [mockPermission],
      };

      mockRepository.findOne.mockResolvedValue(mockRole);
      mockPermissionService.findMany.mockResolvedValue([mockPermission]);
      mockRepository.save.mockResolvedValue(updatedRole);

      const result = await service.update(1, updateData);

      expect(result).toEqual(updatedRole);
      expect(mockPermissionService.findMany).toHaveBeenCalledWith({
        where: { id: In([1]) },
      });
    });

    it('should throw NotFoundException when role not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a role', async () => {
      const mockUpdateResult: UpdateResult = {
        affected: 1,
        raw: [],
        generatedMaps: [],
      };
      jest.spyOn(service, 'softDeleteById').mockResolvedValue(mockUpdateResult);

      await service.delete(1);

      expect(service.softDeleteById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when role not found', async () => {
      jest.spyOn(service, 'softDeleteById').mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
