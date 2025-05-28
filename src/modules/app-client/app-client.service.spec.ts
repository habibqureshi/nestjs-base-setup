import { Test, TestingModule } from '@nestjs/testing';
import { AppClientService } from './app-client.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppClient } from './entities/app-client.entity';
import { Repository } from 'typeorm';

describe('AppClientService', () => {
  let service: AppClientService;
  let repository: Repository<AppClient>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppClientService,
        {
          provide: getRepositoryToken(AppClient),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AppClientService>(AppClientService);
    repository = module.get<Repository<AppClient>>(
      getRepositoryToken(AppClient),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should initialize with repository', () => {
      expect(service).toBeInstanceOf(AppClientService);
      expect(repository).toBeDefined();
    });
  });

  describe('inherited methods', () => {
    const mockAppClient = {
      id: 1,
      name: 'Test Client',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      enable: true,
      deleted: false,
    } as AppClient;

    describe('findOneOrNull', () => {
      it('should return app client when found', async () => {
        // Arrange
        const options = { where: { clientId: 'test-client-id' } };
        mockRepository.findOne.mockResolvedValue(mockAppClient);

        // Act
        const result = await service.findOneOrNull(options);

        // Assert
        expect(result).toEqual(mockAppClient);
        expect(repository.findOne).toHaveBeenCalledWith(options);
      });

      it('should return null when app client not found', async () => {
        // Arrange
        const options = { where: { clientId: 'non-existent' } };
        mockRepository.findOne.mockResolvedValue(null);

        // Act
        const result = await service.findOneOrNull(options);

        // Assert
        expect(result).toBeNull();
        expect(repository.findOne).toHaveBeenCalledWith(options);
      });
    });

    describe('findMany', () => {
      it('should return array of app clients', async () => {
        // Arrange
        const options = { where: { enable: true } };
        const mockClients = [mockAppClient];
        mockRepository.find.mockResolvedValue(mockClients);

        // Act
        const result = await service.findMany(options);

        // Assert
        expect(result).toEqual(mockClients);
        expect(repository.find).toHaveBeenCalledWith(options);
      });
    });

    describe('save', () => {
      it('should save new app client', async () => {
        // Arrange
        const newClient = { name: 'New Client' };
        mockRepository.create.mockReturnValue(mockAppClient);
        mockRepository.save.mockResolvedValue(mockAppClient);

        // Act
        const result = await service.save(newClient);

        // Assert
        expect(result).toEqual(mockAppClient);
        expect(repository.create).toHaveBeenCalledWith(newClient);
        expect(repository.save).toHaveBeenCalledWith(mockAppClient);
      });
    });

    describe('softDeleteById', () => {
      it('should soft delete app client by id', async () => {
        // Arrange
        const id = 1;
        mockRepository.findOne.mockResolvedValue(mockAppClient);
        mockRepository.save.mockResolvedValue({
          ...mockAppClient,
          enable: false,
          deleted: true,
        });
        mockRepository.softDelete = jest
          .fn()
          .mockResolvedValue({ affected: 1 });

        // Act
        const result = await service.softDeleteById(id);

        // Assert
        expect(result).toEqual({ affected: 1 });
        expect(repository.findOne).toHaveBeenCalledWith({
          where: { id, enable: true, deleted: false },
        });
        expect(repository.save).toHaveBeenCalled();
        expect(repository.softDelete).toHaveBeenCalledWith(id);
      });

      it('should return null when app client not found', async () => {
        // Arrange
        const id = 999;
        mockRepository.findOne.mockResolvedValue(null);

        // Act
        const result = await service.softDeleteById(id);

        // Assert
        expect(result).toBeNull();
        expect(repository.findOne).toHaveBeenCalledWith({
          where: { id, enable: true, deleted: false },
        });
        expect(repository.save).not.toHaveBeenCalled();
        expect(repository.softDelete).not.toHaveBeenCalled();
      });
    });
  });
});
