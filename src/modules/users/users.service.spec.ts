import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { RoleService } from '../roles/roles.service';
import { CustomLoggerService } from '../logger/logger.service';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let loggerService: CustomLoggerService;

  const mockRole: Role = {
    id: 1,
    name: 'Test Role',
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

  const mockRoleService = {
    findMany: jest.fn(),
  };

  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: RoleService,
          useValue: mockRoleService,
        },
        {
          provide: CustomLoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    loggerService = module.get<CustomLoggerService>(CustomLoggerService);

    // Reset all mocks
    jest.clearAllMocks();

    // Mock bcrypt hash
    jest
      .spyOn(bcrypt, 'hash')
      .mockImplementation((_) => Promise.resolve('hashedPassword'));

    // Mock save method
    jest
      .spyOn(service, 'save')
      .mockImplementation((data) => Promise.resolve(data as User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with roles', async () => {
      const createUserDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        roles: [1],
      };

      const userWithRoles = {
        id: 1,
        name: createUserDto.name,
        email: createUserDto.email,
        password: 'hashedPassword',
        roles: [mockRole],
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

      mockRoleService.findMany.mockResolvedValue([mockRole]);
      jest.spyOn(service, 'save').mockResolvedValue(userWithRoles);

      const result = await service.create(createUserDto);

      expect(result).toEqual(userWithRoles);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockRoleService.findMany).toHaveBeenCalledWith({
        where: { id: In([1]) },
      });
      expect(loggerService.log).toHaveBeenCalled();
      expect(service.save).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashedPassword',
        roles: [mockRole],
      });
    });

    it('should create a user without roles', async () => {
      const createUserDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        roles: [],
      };

      const userWithoutRoles = {
        id: 1,
        name: createUserDto.name,
        email: createUserDto.email,
        password: 'hashedPassword',
        roles: [],
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

      jest.spyOn(service, 'save').mockResolvedValue(userWithoutRoles);

      const result = await service.create(createUserDto);

      expect(result).toEqual(userWithoutRoles);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockRoleService.findMany).not.toHaveBeenCalled();
      expect(loggerService.log).toHaveBeenCalled();
      expect(service.save).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashedPassword',
        roles: [],
      });
    });

    it('should handle password hashing error', async () => {
      const createUserDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        roles: [],
      };

      // Reset the save spy for this test
      jest.spyOn(service, 'save').mockReset();
      jest
        .spyOn(bcrypt, 'hash')
        .mockRejectedValue(new Error('Hashing failed') as never);

      await expect(service.create(createUserDto)).rejects.toThrow(
        'Hashing failed',
      );
      expect(mockRoleService.findMany).not.toHaveBeenCalled();
      expect(service.save).not.toHaveBeenCalled();
    });
  });
});
