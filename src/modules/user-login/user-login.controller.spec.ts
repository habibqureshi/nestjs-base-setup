import { Test, TestingModule } from '@nestjs/testing';
import { UserLoginController } from './user-login.controller';
import { UserLoginService } from './user-login.service';
import { IUser } from 'src/interfaces/user.interface';
import { Permission } from 'src/modules/permissions/entities/permission.entity';

describe('UserLoginController', () => {
  let controller: UserLoginController;

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

  const mockUser: IUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    permissions: {
      'test:permission': {
        roleId: 1,
        roleName: 'Test Role',
        permission: mockPermission,
      },
    },
  };

  const mockUserLoginService = {
    findManyWithPagination: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserLoginController],
      providers: [
        {
          provide: UserLoginService,
          useValue: mockUserLoginService,
        },
      ],
    }).compile();

    controller = module.get<UserLoginController>(UserLoginController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserLogins', () => {
    it('should return paginated user logins', async () => {
      // Arrange
      const query = { page: 1, limit: 10 };
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

      mockUserLoginService.findManyWithPagination.mockResolvedValue(
        expectedResult,
      );

      // Act
      const result = await controller.getUserLogins(mockUser);
      const response = await result({ headers: {}, query });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedResult);
      expect(mockUserLoginService.findManyWithPagination).toHaveBeenCalledWith(
        {
          where: {
            user: { id: mockUser.id },
          },
        },
        query,
      );
    });

    it('should handle empty results', async () => {
      // Arrange
      const query = { page: 1, limit: 10 };
      const expectedResult = {
        items: [],
        meta: {
          itemCount: 0,
          totalItems: 0,
          itemsPerPage: 10,
          totalPages: 0,
          currentPage: 1,
        },
      };

      mockUserLoginService.findManyWithPagination.mockResolvedValue(
        expectedResult,
      );

      // Act
      const result = await controller.getUserLogins(mockUser);
      const response = await result({ headers: {}, query });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedResult);
      expect(mockUserLoginService.findManyWithPagination).toHaveBeenCalledWith(
        {
          where: {
            user: { id: mockUser.id },
          },
        },
        query,
      );
    });

    it('should handle service errors', async () => {
      // Arrange
      const query = { page: 1, limit: 10 };
      mockUserLoginService.findManyWithPagination.mockRejectedValue(
        new Error('Service error'),
      );

      // Act & Assert
      const result = await controller.getUserLogins(mockUser);
      await expect(result({ headers: {}, query })).rejects.toThrow(
        'Service error',
      );
    });
  });
});
