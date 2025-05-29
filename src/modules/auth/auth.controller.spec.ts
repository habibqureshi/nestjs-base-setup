import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IUser } from 'src/interfaces/user.interface';
import { TokenResponseSchema } from 'src/common/types/auth.types';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    refresh: jest.fn(),
  };

  const mockUser: IUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    permissions: null,
  };

  const mockTokenResponse: TokenResponseSchema = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    user: {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
    },
  };

  const mockRequest = {
    body: {},
    headers: {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
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
      mockAuthService.login.mockResolvedValue(mockTokenResponse);

      // Act
      const result = await (await controller.login(mockUser))(mockRequest);

      // Assert
      expect(result).toEqual({ status: 200, body: mockTokenResponse });
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should throw error if user is not provided', async () => {
      // Arrange
      mockAuthService.login.mockRejectedValue(new Error('User not found!'));

      // Act & Assert
      await expect(
        (await controller.login(undefined))(mockRequest),
      ).rejects.toThrow('User not found!');
    });
  });

  describe('refresh', () => {
    it('should return new token response on successful refresh', async () => {
      // Arrange
      mockAuthService.refresh.mockResolvedValue(mockTokenResponse);

      // Act
      const result = await (await controller.refresh(mockUser))(mockRequest);

      // Assert
      expect(result).toEqual({ status: 200, body: mockTokenResponse });
      expect(authService.refresh).toHaveBeenCalledWith(mockUser);
    });

    it('should throw error if user is not provided', async () => {
      // Arrange
      mockAuthService.refresh.mockRejectedValue(new Error('User not found!'));

      // Act & Assert
      await expect(
        (await controller.refresh(undefined))(mockRequest),
      ).rejects.toThrow('User not found!');
    });
  });
});
