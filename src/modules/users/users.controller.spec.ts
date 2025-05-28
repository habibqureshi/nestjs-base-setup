import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleService } from '../roles/roles.service';
import { CustomLoggerService } from '../logger/logger.service';
import { Role } from '../roles/entities/role.entity';

describe('UsersController', () => {
  let controller: UsersController;

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

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
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

  const mockUserService = {
    findManyWithPagination: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUserService,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: RoleService,
          useValue: {
            findMany: jest.fn(),
          },
        },
        {
          provide: CustomLoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUser', () => {
    it('should return paginated users', async () => {
      const query = { page: 1, limit: 10 };
      const expectedResult = {
        items: [mockUser],
        meta: {
          itemCount: 1,
          totalItems: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      };

      mockUserService.findManyWithPagination.mockResolvedValue(expectedResult);

      const result = await controller.getUser();
      const response = await result({ headers: {}, query });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedResult);
      expect(mockUserService.findManyWithPagination).toHaveBeenCalledWith(
        {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        query,
      );
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        roles: [1],
      };

      mockUserService.create.mockResolvedValue({
        ...mockUser,
        ...createUserDto,
      });

      const result = await controller.create();
      const response = await result({
        headers: {},
        body: createUserDto,
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ...mockUser, ...createUserDto });
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
    });
  });
});
