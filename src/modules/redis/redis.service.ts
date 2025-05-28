import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { APP_CONFIGS } from 'src/config/app.config';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<T> {
    return await this.cacheManager.set(
      key,
      value,
      ttl || APP_CONFIGS.REDIS.USER_TTL,
    );
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.clear();
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.cacheManager.get('test');
      return true;
    } catch (error) {
      return false;
    }
  }
}
