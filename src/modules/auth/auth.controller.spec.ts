import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpStatus, UnauthorizedException } from '@nestjs/common';
import { IUser } from 'src/interfaces/user.interface';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser: IUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    permissions: null,
  };

  const mockTokenResponse = {
    accessToken: 'new-access-token',
    refreshToken: 'new-refresh-token',
    user: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue(mockTokenResponse),
            refresh: jest.fn().mockResolvedValue(mockTokenResponse),
            logout: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return token response on successful login', async () => {
      // Arrange
      const mockLoginRequest = {
        body: {},
        headers: {},
      };

      // Act
      const handler = await controller.login(mockUser);
      const result = await handler(mockLoginRequest);

      // Assert
      expect(result).toEqual({
        status: HttpStatus.OK,
        body: mockTokenResponse,
      });
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('refresh', () => {
    it('should return new token response on successful refresh', async () => {
      // Arrange
      const mockRefreshRequest = {
        headers: {
          authorization: 'Bearer old-refresh-token',
        },
        body: {
          accessToken: 'old-access-token',
        },
      };

      // Act
      const handler = await controller.refresh(mockUser);
      const result = await handler(mockRefreshRequest);

      // Assert
      expect(result).toEqual({
        status: HttpStatus.OK,
        body: mockTokenResponse,
      });
      expect(authService.refresh).toHaveBeenCalledWith(mockUser, {
        accessToken: 'old-access-token',
        refreshToken: 'Bearer old-refresh-token',
      });
    });

    it('should throw error if user is not provided', async () => {
      // Arrange
      const mockRefreshRequest = {
        headers: {
          authorization: 'Bearer old-refresh-token',
        },
        body: {
          accessToken: 'old-access-token',
        },
      };

      // Mock the authService to throw an error for null user
      jest
        .spyOn(authService, 'refresh')
        .mockRejectedValueOnce(new UnauthorizedException(['User not found']));

      // Act & Assert
      const handler = await controller.refresh(null);
      await expect(handler(mockRefreshRequest)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should return success message on logout', async () => {
      // Arrange
      const mockLogoutRequest = {
        headers: {
          authorization: 'Bearer token-to-logout',
        },
      };

      // Act
      const handler = await controller.logout();
      const result = await handler(mockLogoutRequest);

      // Assert
      expect(result).toEqual({
        status: HttpStatus.OK,
        body: { message: 'Logged out successfully!' },
      });
      expect(authService.logout).toHaveBeenCalledWith('Bearer token-to-logout');
    });
  });
});
