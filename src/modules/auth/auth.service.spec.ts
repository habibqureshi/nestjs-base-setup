import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CustomLoggerService } from '../logger/logger.service';
import { BadRequestException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { APP_CONFIGS } from 'src/config/app.config';
import { IUser } from 'src/interfaces/user.interface';
import { RedisService } from '../redis/redis.service';
import { AppClientService } from '../app-client/app-client.service';
import * as bcrypt from 'bcrypt';

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

      // Act
      const result = await service.validateUser('john@example.com', 'password');

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
    });

    it('should throw BadRequestException if user not found', async () => {
      // Arrange
      mockUsersService.findOneOrNull.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.validateUser('john@example.com', 'password'),
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
        service.validateUser('john@example.com', 'wrong_password'),
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

      // Act
      const result = await service.validateUser('john@example.com', 'password');

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

      // Act
      const result = await service.validateUser('john@example.com', 'password');

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
        service.validateUser('john@example.com', 'password'),
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
      const mockUserWithRefreshToken = {
        ...mockUser,
        refreshToken: 'mock-refresh-token',
      };

      // Act
      const result = await service.refresh(mockUserWithRefreshToken);

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
    });

    it('should handle Redis set error gracefully during refresh', async () => {
      // Arrange
      const mockTokens = ['new-access-token', 'new-refresh-token'];
      mockJwtService.signAsync.mockResolvedValueOnce(mockTokens[0]);
      mockJwtService.signAsync.mockResolvedValueOnce(mockTokens[1]);
      mockRedisService.set.mockRejectedValue(new Error('Redis error'));
      const mockUserWithRefreshToken = {
        ...mockUser,
        refreshToken: 'mock-refresh-token',
      };

      // Act
      const result = await service.refresh(mockUserWithRefreshToken);

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
      await expect(service.refresh(mockUser)).rejects.toThrow('JWT error');
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
    const mockClient = {
      id: 1,
      clientId: 'test-client',
      clientSecret: 'hashed_secret',
      deleted: false,
    };

    it('should validate client successfully', async () => {
      // Arrange
      mockAppClientService.findOneOrNull.mockResolvedValue(mockClient);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      // Act
      const result = await service.validateClient('test-client', 'secret');

      // Assert
      expect(result).toBe(true);
      expect(mockLoggerService.log).toHaveBeenCalledWith('checking client');
      expect(mockAppClientService.findOneOrNull).toHaveBeenCalledWith({
        where: { clientId: 'test-client' },
      });
    });

    it('should throw UnauthorizedErrorInterceptor if client not found', async () => {
      // Arrange
      mockAppClientService.findOneOrNull.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.validateClient('test-client', 'secret'),
      ).rejects.toMatchObject({
        response: {
          status: 401,
          errors: ['Invalid client!'],
        },
      });
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        'invalid client test-client',
      );
    });

    it('should throw UnauthorizedErrorInterceptor if client is deleted', async () => {
      // Arrange
      mockAppClientService.findOneOrNull.mockResolvedValue({
        ...mockClient,
        deleted: true,
      });

      // Act & Assert
      await expect(
        service.validateClient('test-client', 'secret'),
      ).rejects.toMatchObject({
        response: {
          status: 401,
          errors: ['Invalid client!'],
        },
      });
      expect(mockLoggerService.log).toHaveBeenCalledWith(
        'invalid client test-client',
      );
    });

    it('should throw UnauthorizedErrorInterceptor if password is invalid', async () => {
      // Arrange
      mockAppClientService.findOneOrNull.mockResolvedValue(mockClient);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      // Act & Assert
      await expect(
        service.validateClient('test-client', 'wrong_secret'),
      ).rejects.toMatchObject({
        response: {
          status: 401,
          errors: ['Invalid client!'],
        },
      });
      expect(mockLoggerService.log).toHaveBeenCalledWith('invalid password!');
    });
  });
});
