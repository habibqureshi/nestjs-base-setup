import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { APP_CONFIGS } from 'src/config/app.config';

describe('RedisService', () => {
  let service: RedisService;
  let cacheManager: Cache;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return cached value when key exists', async () => {
      // Arrange
      const key = 'test-key';
      const expectedValue = { data: 'test-data' };
      mockCacheManager.get.mockResolvedValue(expectedValue);

      // Act
      const result = await service.get(key);

      // Assert
      expect(result).toEqual(expectedValue);
      expect(mockCacheManager.get).toHaveBeenCalledWith(key);
    });

    it('should return undefined when key does not exist', async () => {
      // Arrange
      const key = 'non-existent-key';
      mockCacheManager.get.mockResolvedValue(undefined);

      // Act
      const result = await service.get(key);

      // Assert
      expect(result).toBeUndefined();
      expect(mockCacheManager.get).toHaveBeenCalledWith(key);
    });
  });

  describe('set', () => {
    it('should set value with default TTL', async () => {
      // Arrange
      const key = 'test-key';
      const value = { data: 'test-data' };
      mockCacheManager.set.mockResolvedValue(value);

      // Act
      const result = await service.set(key, value);

      // Assert
      expect(result).toEqual(value);
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        key,
        value,
        APP_CONFIGS.REDIS.USER_TTL,
      );
    });

    it('should set value with custom TTL', async () => {
      // Arrange
      const key = 'test-key';
      const value = { data: 'test-data' };
      const customTTL = 3600;
      mockCacheManager.set.mockResolvedValue(value);

      // Act
      const result = await service.set(key, value, customTTL);

      // Assert
      expect(result).toEqual(value);
      expect(mockCacheManager.set).toHaveBeenCalledWith(key, value, customTTL);
    });
  });

  describe('del', () => {
    it('should delete cached value', async () => {
      // Arrange
      const key = 'test-key';
      mockCacheManager.del.mockResolvedValue(undefined);

      // Act
      await service.del(key);

      // Assert
      expect(mockCacheManager.del).toHaveBeenCalledWith(key);
    });
  });

  describe('reset', () => {
    it('should clear all cached values', async () => {
      // Arrange
      mockCacheManager.clear.mockResolvedValue(undefined);

      // Act
      await service.reset();

      // Assert
      expect(mockCacheManager.clear).toHaveBeenCalled();
    });
  });

  describe('isAvailable', () => {
    it('should return true when cache is available', async () => {
      // Arrange
      mockCacheManager.get.mockResolvedValue(undefined);

      // Act
      const result = await service.isAvailable();

      // Assert
      expect(result).toBe(true);
      expect(mockCacheManager.get).toHaveBeenCalledWith('test');
    });

    it('should return false when cache throws error', async () => {
      // Arrange
      mockCacheManager.get.mockRejectedValue(new Error('Cache error'));

      // Act
      const result = await service.isAvailable();

      // Assert
      expect(result).toBe(false);
      expect(mockCacheManager.get).toHaveBeenCalledWith('test');
    });
  });
});
