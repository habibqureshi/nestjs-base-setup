import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CustomLoggerService } from '../logger/logger.service';
import { RedisService } from '../redis/redis.service';
import { AppClientService } from '../app-client/app-client.service';
import { UserLoginService } from '../user-login/user-login.service';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { APP_CONFIGS } from 'src/config/app.config';
import { IUser } from 'src/interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import { UnauthorizedErrorInterceptor } from 'src/config/interceptors/unauthorized.interceptor';
import { PREFIX } from 'src/common/constants/redis';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = Object.assign(new User(), {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed_password',
    refreshToken: 'mock-refresh-token',
    roles: [
      {
        id: 1,
        name: 'admin',
        permissions: [
          {
            id: 1,
            name: 'read',
            url: '/api/users',
          } as Permission,
        ],
      } as Role,
    ],
    permissions: {
      read: {
        roleId: 1,
        roleName: 'admin',
        permission: {
          id: 1,
          name: 'read',
          url: '/api/users',
        } as Permission,
      },
    } as Record<
      string,
      { roleId: number; roleName: string; permission: Permission }
    >,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    deleted: false,
    enable: true,
    __entity: 'User',
  }) as User & IUser;

  const mockRequest = {
    headers: {},
    ip: '127.0.0.1',
    get: jest.fn().mockReturnValue('Mozilla/5.0'),
  } as unknown as Request;

  const mockPrevTokens = {
    accessToken: 'old-access-token',
    refreshToken: 'old-refresh-token',
  };

  const mockUsersService = {
    findOneOrNull: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockLoggerService = {
    log: jest.fn(),
  };

  const mockRedisService = {
    set: jest.fn(),
    get: jest.fn(),
  };

  const mockAppClientService = {
    findOneOrNull: jest.fn(),
  };

  const mockUserLoginService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: CustomLoggerService,
          useValue: mockLoggerService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: AppClientService,
          useValue: mockAppClientService,
        },
        {
          provide: UserLoginService,
          useValue: mockUserLoginService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      // Arrange
      mockUsersService.findOneOrNull.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      mockRedisService.set.mockResolvedValue(undefined);
      mockUserLoginService.create.mockResolvedValue(undefined);

      // Act
      const result = await service.validateUser(
        mockRequest,
        'john@example.com',
        'password',
      );

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        permissions: {
          '/api/users': {
            roleId: 1,
            roleName: 'admin',
            permission: {
              id: 1,
              name: 'read',
              url: '/api/users',
            },
          },
        },
      });
      expect(usersService.findOneOrNull).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
        relations: ['roles', 'roles.permissions'],
        select: {
          password: true,
          id: true,
          name: true,
          email: true,
          roles: {
            id: true,
            name: true,
            permissions: { id: true, name: true, url: true },
          },
        },
      });
      expect(mockUserLoginService.create).toHaveBeenCalledWith(
        mockRequest,
        mockUser,
      );
    });

    it('should throw BadRequestException if user not found', async () => {
      // Arrange
      mockUsersService.findOneOrNull.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.validateUser(mockRequest, 'john@example.com', 'password'),
      ).rejects.toThrow(BadRequestException);
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        'User not found for john@example.com',
      );
    });

    it('should throw BadRequestException if password does not match', async () => {
      // Arrange
      mockUsersService.findOneOrNull.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

      // Act & Assert
      await expect(
        service.validateUser(mockRequest, 'john@example.com', 'wrong_password'),
      ).rejects.toThrow(BadRequestException);
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        'Password does not match for john@example.com',
      );
    });

    it('should handle user with no roles', async () => {
      // Arrange
      const userWithoutRoles = { ...mockUser, roles: [] };
      mockUsersService.findOneOrNull.mockResolvedValue(userWithoutRoles);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      mockRedisService.set.mockResolvedValue(undefined);
      mockUserLoginService.create.mockResolvedValue(undefined);

      // Act
      const result = await service.validateUser(
        mockRequest,
        'john@example.com',
        'password',
      );

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        permissions: {},
      });
    });

    it('should handle user with roles but no permissions', async () => {
      // Arrange
      const userWithoutPermissions = {
        ...mockUser,
        roles: [{ id: 1, name: 'admin', permissions: [] }],
      };
      mockUsersService.findOneOrNull.mockResolvedValue(userWithoutPermissions);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      mockRedisService.set.mockResolvedValue(undefined);
      mockUserLoginService.create.mockResolvedValue(undefined);

      // Act
      const result = await service.validateUser(
        mockRequest,
        'john@example.com',
        'password',
      );

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        permissions: {},
      });
    });

    it('should handle Redis set error gracefully', async () => {
      // Arrange
      mockUsersService.findOneOrNull.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      mockRedisService.set.mockRejectedValue(new Error('Redis error'));

      // Act & Assert
      await expect(
        service.validateUser(mockRequest, 'john@example.com', 'password'),
      ).rejects.toThrow('Redis error');
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `USER:${mockUser.id}`,
        expect.any(Object),
      );
    });
  });

  describe('login', () => {
    it('should return token response on successful login', async () => {
      // Arrange
      const mockTokens = ['access-token', 'refresh-token'];
      mockJwtService.signAsync.mockResolvedValueOnce(mockTokens[0]);
      mockJwtService.signAsync.mockResolvedValueOnce(mockTokens[1]);

      // Act
      const result = await service.login(mockUser);

      // Assert
      expect(result).toEqual({
        accessToken: mockTokens[0],
        refreshToken: mockTokens[1],
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        },
      });
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        { sub: mockUser.id },
        { expiresIn: APP_CONFIGS.JWT.TOKEN_EXPIRY },
      );
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        { sub: mockUser.id },
        {
          secret: APP_CONFIGS.JWT.REFRESH_SECRET,
          expiresIn: APP_CONFIGS.JWT.REFRESH_EXPIRY,
        },
      );
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `logged in  user ${mockUser.id}`,
      );
    });

    it('should throw BadRequestException if user is not provided', async () => {
      // Act & Assert
      await expect(service.login(undefined)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockLoggerService.log).toHaveBeenCalledWith('user not found');
    });

    it('should handle Redis set error gracefully', async () => {
      // Arrange
      const mockTokens = ['access-token', 'refresh-token'];
      mockJwtService.signAsync.mockResolvedValueOnce(mockTokens[0]);
      mockJwtService.signAsync.mockResolvedValueOnce(mockTokens[1]);
      mockRedisService.set.mockRejectedValue(new Error('Redis error'));

      // Act
      const result = await service.login(mockUser);

      // Assert
      expect(result).toEqual({
        accessToken: mockTokens[0],
        refreshToken: mockTokens[1],
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        },
      });
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `logged in  user ${mockUser.id}`,
      );
    });

    it('should handle JWT sign error gracefully', async () => {
      // Arrange
      mockJwtService.signAsync.mockRejectedValue(new Error('JWT error'));

      // Act & Assert
      await expect(service.login(mockUser)).rejects.toThrow('JWT error');
    });
  });

  describe('refresh', () => {
    it('should return new token response on successful refresh', async () => {
      // Arrange
      const mockTokens = ['new-access-token', 'new-refresh-token'];
      mockJwtService.signAsync.mockResolvedValueOnce(mockTokens[0]);
      mockJwtService.signAsync.mockResolvedValueOnce(mockTokens[1]);
      mockRedisService.set.mockResolvedValue(undefined);

      // Act
      const result = await service.refresh(mockUser, mockPrevTokens);

      // Assert
      expect(result).toEqual({
        accessToken: mockTokens[0],
        refreshToken: mockTokens[1],
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        },
      });
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockRedisService.set).toHaveBeenCalledTimes(2);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        expect.stringContaining(mockPrevTokens.accessToken),
        true,
      );
      expect(mockRedisService.set).toHaveBeenCalledWith(
        expect.stringContaining(mockPrevTokens.refreshToken),
        true,
      );
    });

    it('should handle Redis set error gracefully during refresh', async () => {
      // Arrange
      const mockTokens = ['new-access-token', 'new-refresh-token'];
      mockJwtService.signAsync.mockResolvedValueOnce(mockTokens[0]);
      mockJwtService.signAsync.mockResolvedValueOnce(mockTokens[1]);
      mockRedisService.set.mockRejectedValue(new Error('Redis error'));

      // Act
      const result = await service.refresh(mockUser, mockPrevTokens);

      // Assert
      expect(result).toEqual({
        accessToken: mockTokens[0],
        refreshToken: mockTokens[1],
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        },
      });
    });

    it('should handle JWT sign error gracefully', async () => {
      // Arrange
      mockJwtService.signAsync.mockRejectedValue(new Error('JWT error'));

      // Act & Assert
      await expect(service.refresh(mockUser, mockPrevTokens)).rejects.toThrow(
        'JWT error',
      );
    });
  });

  describe('findUserById', () => {
    it('should return cached user from Redis if available', async () => {
      // Arrange
      const cachedUser = { ...mockUser };
      mockRedisService.get.mockResolvedValue(cachedUser);

      // Act
      const result = await service.findUserById(1);

      // Assert
      expect(result).toEqual(cachedUser);
      expect(mockRedisService.get).toHaveBeenCalledWith('USER:1');
      expect(mockUsersService.findOneOrNull).not.toHaveBeenCalled();
    });

    it('should fetch user from database if not in cache', async () => {
      // Arrange
      mockRedisService.get.mockResolvedValue(null);
      mockUsersService.findOneOrNull.mockResolvedValue(mockUser);

      // Act
      const result = await service.findUserById(1);

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        permissions: {
          '/api/users': {
            roleId: 1,
            roleName: 'admin',
            permission: {
              id: 1,
              name: 'read',
              url: '/api/users',
            },
          },
        },
      });
      expect(mockRedisService.get).toHaveBeenCalledWith('USER:1');
      expect(mockUsersService.findOneOrNull).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['roles', 'roles.permissions'],
        select: {
          id: true,
          email: true,
          name: true,
          roles: {
            id: true,
            name: true,
            permissions: { id: true, name: true, url: true },
          },
        },
      });
    });

    it('should throw ForbiddenErrorInterceptor if user not found', async () => {
      // Arrange
      mockRedisService.get.mockResolvedValue(null);
      mockUsersService.findOneOrNull.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findUserById(1)).rejects.toMatchObject({
        response: {
          status: 403,
          errors: ['Invalid user!'],
        },
      });
      expect(mockLoggerService.log).toHaveBeenCalledWith('Invalid user id 1');
    });
  });

  describe('validateClient', () => {
    it('should validate client successfully', async () => {
      // Arrange
      const clientId = 'test-client';
      const clientSecret = 'hashed-secret';
      const mockClient = {
        clientId,
        clientSecret,
        deleted: false,
      };
      mockAppClientService.findOneOrNull.mockResolvedValue(mockClient);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      // Act
      const result = await service.validateClient(clientId, 'raw-secret');

      // Assert
      expect(result).toBe(true);
      expect(mockAppClientService.findOneOrNull).toHaveBeenCalledWith({
        where: { clientId },
      });
      expect(mockLoggerService.log).toHaveBeenCalledWith('checking client');
    });

    it('should throw UnauthorizedErrorInterceptor when client not found', async () => {
      // Arrange
      const clientId = 'non-existent-client';
      mockAppClientService.findOneOrNull.mockResolvedValue(null);

      // Act & Assert
      await expect(service.validateClient(clientId, 'secret')).rejects.toThrow(
        UnauthorizedErrorInterceptor,
      );
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `invalid client ${clientId}`,
      );
    });

    it('should throw UnauthorizedErrorInterceptor when client is deleted', async () => {
      // Arrange
      const clientId = 'deleted-client';
      const mockClient = {
        clientId,
        clientSecret: 'hashed-secret',
        deleted: true,
      };
      mockAppClientService.findOneOrNull.mockResolvedValue(mockClient);

      // Act & Assert
      await expect(service.validateClient(clientId, 'secret')).rejects.toThrow(
        UnauthorizedErrorInterceptor,
      );
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `invalid client ${clientId}`,
      );
    });

    it('should throw UnauthorizedErrorInterceptor when secret is invalid', async () => {
      // Arrange
      const clientId = 'test-client';
      const clientSecret = 'hashed-secret';
      const mockClient = {
        clientId,
        clientSecret,
        deleted: false,
      };
      mockAppClientService.findOneOrNull.mockResolvedValue(mockClient);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      // Act & Assert
      await expect(
        service.validateClient(clientId, 'wrong-secret'),
      ).rejects.toThrow(UnauthorizedErrorInterceptor);
      expect(mockLoggerService.log).toHaveBeenCalledWith('invalid password!');
    });
  });

  describe('logout', () => {
    it('should block token with Bearer prefix', async () => {
      // Arrange
      const token = 'test-token';
      const authorization = `Bearer ${token}`;
      mockRedisService.set.mockResolvedValue(undefined);

      // Act
      await service.logout(authorization);

      // Assert
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `${PREFIX.BLOCKED_TOKEN}${token}`,
        true,
      );
    });

    it('should block token with bearer prefix', async () => {
      // Arrange
      const token = 'test-token';
      const authorization = `bearer ${token}`;
      mockRedisService.set.mockResolvedValue(undefined);

      // Act
      await service.logout(authorization);

      // Assert
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `${PREFIX.BLOCKED_TOKEN}${token}`,
        true,
      );
    });

    it('should block token without prefix', async () => {
      // Arrange
      const token = 'test-token';
      mockRedisService.set.mockResolvedValue(undefined);

      // Act
      await service.logout(token);

      // Assert
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `${PREFIX.BLOCKED_TOKEN}${token}`,
        true,
      );
    });

    it('should handle Redis set error gracefully', async () => {
      // Arrange
      const token = 'test-token';
      const authorization = `Bearer ${token}`;
      mockRedisService.set.mockRejectedValue(new Error('Redis error'));

      // Act & Assert
      await expect(service.logout(authorization)).rejects.toThrow(
        'Redis error',
      );
    });
  });

  describe('isBlocked', () => {
    it('should return true when token is blocked', async () => {
      // Arrange
      const token = 'test-token';
      mockRedisService.get.mockResolvedValue(true);

      // Act
      const result = await service.isBlocked(token);

      // Assert
      expect(result).toBe(true);
      expect(mockRedisService.get).toHaveBeenCalledWith(
        `${PREFIX.BLOCKED_TOKEN}${token}`,
      );
    });

    it('should return null when token is not blocked', async () => {
      // Arrange
      const token = 'test-token';
      mockRedisService.get.mockResolvedValue(null);

      // Act
      const result = await service.isBlocked(token);

      // Assert
      expect(result).toBeNull();
      expect(mockRedisService.get).toHaveBeenCalledWith(
        `${PREFIX.BLOCKED_TOKEN}${token}`,
      );
    });

    it('should handle Redis get error gracefully', async () => {
      // Arrange
      const token = 'test-token';
      mockRedisService.get.mockRejectedValue(new Error('Redis error'));

      // Act & Assert
      await expect(service.isBlocked(token)).rejects.toThrow('Redis error');
    });
  });
});
