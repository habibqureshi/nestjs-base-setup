import { Test, TestingModule } from '@nestjs/testing';
import { UserLoginService } from './user-login.service';
import { CustomLoggerService } from '../logger/logger.service';
import { User } from '../users/entities/user.entity';
import { Request } from 'express';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserLogin } from './entities/user-login.entity';

describe('UserLoginService', () => {
  let service: UserLoginService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockLoggerService = {
    log: jest.fn(),
  };

  const mockRequest = {
    headers: {
      'user-agent': 'Mozilla/5.0',
    },
    ip: '127.0.0.1',
  } as unknown as Request;

  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
  } as User;

  const createMockQueryBuilder = () => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getRawOne: jest.fn().mockResolvedValue({ count: 0 }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserLoginService,
        {
          provide: getRepositoryToken(UserLogin),
          useValue: mockRepository,
        },
        {
          provide: CustomLoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<UserLoginService>(UserLoginService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create user login record with direct IP', async () => {
      // Arrange
      const mockUserLogin = {
        user: mockUser,
        ipAddress: mockRequest.ip,
        userAgent: mockRequest.headers['user-agent'],
        provider: 'email',
      };
      mockRepository.create.mockReturnValue(mockUserLogin);
      mockRepository.save.mockResolvedValue(mockUserLogin);

      // Act
      await service.create(mockRequest, mockUser);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        ipAddress: mockRequest.ip,
        userAgent: mockRequest.headers['user-agent'],
        provider: 'email',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockUserLogin);
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `Creating user login for user ${mockUser.id}`,
      );
    });

    it('should create user login record with x-forwarded-for IP', async () => {
      // Arrange
      const mockRequestWithXForwardedFor = {
        headers: {
          'user-agent': 'Mozilla/5.0',
          'x-forwarded-for': '192.168.1.1',
        },
        ip: '',
      } as unknown as Request;

      const mockUserLogin = {
        user: mockUser,
        ipAddress: '192.168.1.1',
        userAgent: mockRequestWithXForwardedFor.headers['user-agent'],
        provider: 'email',
      };
      mockRepository.create.mockReturnValue(mockUserLogin);
      mockRepository.save.mockResolvedValue(mockUserLogin);

      // Act
      await service.create(mockRequestWithXForwardedFor, mockUser);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        ipAddress: '192.168.1.1',
        userAgent: mockRequestWithXForwardedFor.headers['user-agent'],
        provider: 'email',
      });
    });

    it('should create user login record with array x-forwarded-for IP', async () => {
      // Arrange
      const mockRequestWithArrayXForwardedFor = {
        headers: {
          'user-agent': 'Mozilla/5.0',
          'x-forwarded-for': ['192.168.1.1', '10.0.0.1'],
        },
        ip: '',
      } as unknown as Request;

      const mockUserLogin = {
        user: mockUser,
        ipAddress: '192.168.1.1',
        userAgent: mockRequestWithArrayXForwardedFor.headers['user-agent'],
        provider: 'email',
      };
      mockRepository.create.mockReturnValue(mockUserLogin);
      mockRepository.save.mockResolvedValue(mockUserLogin);

      // Act
      await service.create(mockRequestWithArrayXForwardedFor, mockUser);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        ipAddress: '192.168.1.1',
        userAgent: mockRequestWithArrayXForwardedFor.headers['user-agent'],
        provider: 'email',
      });
    });

    it('should create user login record with x-user-agent', async () => {
      // Arrange
      const mockRequestWithXUserAgent = {
        headers: {
          'x-user-agent': 'Custom User Agent',
        },
        ip: '127.0.0.1',
      } as unknown as Request;

      const mockUserLogin = {
        user: mockUser,
        ipAddress: '127.0.0.1',
        userAgent: 'Custom User Agent',
        provider: 'email',
      };
      mockRepository.create.mockReturnValue(mockUserLogin);
      mockRepository.save.mockResolvedValue(mockUserLogin);

      // Act
      await service.create(mockRequestWithXUserAgent, mockUser);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        ipAddress: '127.0.0.1',
        userAgent: 'Custom User Agent',
        provider: 'email',
      });
    });

    it('should create user login record with array user-agent', async () => {
      // Arrange
      const mockRequestWithArrayUserAgent = {
        headers: {
          'user-agent': ['Mozilla/5.0', 'Chrome/91.0'],
        },
        ip: '127.0.0.1',
      } as unknown as Request;

      const mockUserLogin = {
        user: mockUser,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        provider: 'email',
      };
      mockRepository.create.mockReturnValue(mockUserLogin);
      mockRepository.save.mockResolvedValue(mockUserLogin);

      // Act
      await service.create(mockRequestWithArrayUserAgent, mockUser);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        provider: 'email',
      });
    });

    it('should create user login record with empty headers', async () => {
      // Arrange
      const mockRequestWithEmptyHeaders = {
        headers: {},
        ip: '',
      } as unknown as Request;

      const mockUserLogin = {
        user: mockUser,
        ipAddress: '',
        userAgent: '',
        provider: 'email',
      };
      mockRepository.create.mockReturnValue(mockUserLogin);
      mockRepository.save.mockResolvedValue(mockUserLogin);

      // Act
      await service.create(mockRequestWithEmptyHeaders, mockUser);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        ipAddress: '',
        userAgent: '',
        provider: 'email',
      });
    });

    it('should handle repository error gracefully', async () => {
      // Arrange
      const mockUserLogin = {
        user: mockUser,
        ipAddress: mockRequest.ip,
        userAgent: mockRequest.headers['user-agent'],
        provider: 'email',
      };
      mockRepository.create.mockReturnValue(mockUserLogin);
      mockRepository.save.mockRejectedValue(new Error('Repository error'));

      // Act & Assert
      await expect(service.create(mockRequest, mockUser)).rejects.toThrow(
        'Repository error',
      );
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `Creating user login for user ${mockUser.id}`,
      );
    });

    it('should handle undefined headers gracefully', async () => {
      // Arrange
      const mockRequestWithUndefinedHeaders = {
        headers: undefined,
        ip: '127.0.0.1',
      } as unknown as Request;

      const mockUserLogin = {
        user: mockUser,
        ipAddress: '127.0.0.1',
        userAgent: '',
        provider: 'email',
      };
      mockRepository.create.mockReturnValue(mockUserLogin);
      mockRepository.save.mockResolvedValue(mockUserLogin);

      // Act
      await service.create(mockRequestWithUndefinedHeaders, mockUser);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        ipAddress: '127.0.0.1',
        userAgent: '',
        provider: 'email',
      });
    });

    it('should handle null headers gracefully', async () => {
      // Arrange
      const mockRequestWithNullHeaders = {
        headers: null,
        ip: '127.0.0.1',
      } as unknown as Request;

      const mockUserLogin = {
        user: mockUser,
        ipAddress: '127.0.0.1',
        userAgent: '',
        provider: 'email',
      };
      mockRepository.create.mockReturnValue(mockUserLogin);
      mockRepository.save.mockResolvedValue(mockUserLogin);

      // Act
      await service.create(mockRequestWithNullHeaders, mockUser);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        ipAddress: '127.0.0.1',
        userAgent: '',
        provider: 'email',
      });
    });

    it('should handle all user agent fallbacks', async () => {
      // Arrange
      const mockRequestWithNoUserAgent = {
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        ip: '',
      } as unknown as Request;

      const mockUserLogin = {
        user: mockUser,
        ipAddress: '192.168.1.1',
        userAgent: '',
        provider: 'email',
      };
      mockRepository.create.mockReturnValue(mockUserLogin);
      mockRepository.save.mockResolvedValue(mockUserLogin);

      // Act
      await service.create(mockRequestWithNoUserAgent, mockUser);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        ipAddress: '192.168.1.1',
        userAgent: '',
        provider: 'email',
      });
    });

    it('should handle empty x-user-agent array', async () => {
      // Arrange
      const mockRequestWithEmptyXUserAgentArray = {
        headers: {
          'x-user-agent': [],
        },
        ip: '127.0.0.1',
      } as unknown as Request;

      const mockUserLogin = {
        user: mockUser,
        ipAddress: '127.0.0.1',
        userAgent: '',
        provider: 'email',
      };
      mockRepository.create.mockReturnValue(mockUserLogin);
      mockRepository.save.mockResolvedValue(mockUserLogin);

      // Act
      await service.create(mockRequestWithEmptyXUserAgentArray, mockUser);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        ipAddress: '127.0.0.1',
        userAgent: '',
        provider: 'email',
      });
    });
  });

  describe('findManyWithPagination', () => {
    it('should return paginated user logins', async () => {
      // Arrange
      const options = {
        where: {
          user: { id: mockUser.id },
        },
      };
      const paginationOptions = {
        page: 1,
        limit: 10,
      };
      const expectedResult = {
        items: [
          {
            id: 1,
            user: mockUser,
            ipAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0',
            provider: 'email',
            createdAt: new Date(),
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

      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getMany.mockResolvedValue(expectedResult.items);
      mockQueryBuilder.getRawOne.mockResolvedValue({
        count: expectedResult.meta.totalItems,
      });

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.findManyWithPagination(
        options,
        paginationOptions,
      );

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('entity');
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        'entity.id',
        'DESC',
      );
    });

    it('should handle search options', async () => {
      // Arrange
      const options = {
        where: {
          user: { id: mockUser.id },
        },
      };
      const paginationOptions = {
        page: 1,
        limit: 10,
      };
      const searchOptions = {
        searchTerm: 'test',
        searchFields: ['ipAddress', 'userAgent'],
      };

      const mockQueryBuilder = createMockQueryBuilder();
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      await service.findManyWithPagination(
        options,
        paginationOptions,
        true,
        searchOptions,
      );

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        'entity.id',
        'DESC',
      );
    });

    it('should handle date range options', async () => {
      // Arrange
      const options = {
        where: {
          user: { id: mockUser.id },
        },
      };
      const paginationOptions = {
        page: 1,
        limit: 10,
      };
      const searchOptions = {
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2024-12-31'),
      };

      const mockQueryBuilder = createMockQueryBuilder();
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      await service.findManyWithPagination(
        options,
        paginationOptions,
        true,
        searchOptions,
      );

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        'entity.id',
        'DESC',
      );
    });
  });
});
