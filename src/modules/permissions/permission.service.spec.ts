import { Test, TestingModule } from '@nestjs/testing';
import { PermissionService } from './permission.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { NotFoundException } from '@nestjs/common';

describe('PermissionService', () => {
  let service: PermissionService;

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

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: getRepositoryToken(Permission),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new permission', async () => {
      const newPermission = {
        name: 'New Permission',
        url: '/new',
        regex: '^/new$',
      };

      mockRepository.create.mockReturnValue(newPermission);
      mockRepository.save.mockResolvedValue({
        ...mockPermission,
        ...newPermission,
      });

      const result = await service.create(newPermission);

      expect(result).toEqual({ ...mockPermission, ...newPermission });
      expect(mockRepository.create).toHaveBeenCalledWith(newPermission);
      expect(mockRepository.save).toHaveBeenCalledWith(newPermission);
    });
  });

  describe('findAll', () => {
    it('should return an array of permissions', async () => {
      mockRepository.find.mockResolvedValue([mockPermission]);

      const result = await service.findAll();

      expect(result).toEqual([mockPermission]);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a permission by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockPermission);

      const result = await service.findById(1);

      expect(result).toEqual(mockPermission);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, deleted: false, enable: true },
      });
    });

    it('should throw NotFoundException when permission not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a permission', async () => {
      const updateData = {
        name: 'Updated Permission',
      };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOneBy.mockResolvedValue({
        ...mockPermission,
        ...updateData,
      });

      const result = await service.update(1, updateData);

      expect(result).toEqual({ ...mockPermission, ...updateData });
      expect(mockRepository.update).toHaveBeenCalledWith(1, updateData);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException when permission not found', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(1, { name: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a permission', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when permission not found', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete('1')).rejects.toThrow(NotFoundException);
    });
  });
});
