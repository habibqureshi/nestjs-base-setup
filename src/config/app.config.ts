import * as dotenv from 'dotenv';

dotenv.config({
  path: process.cwd() + '/.env',
});

export const APP_CONFIGS = {
  DB: {
    TYPE: process.env['DB_TYPE'] || 'postgres',
    DB_HOST: process.env['DB_HOST'] || 'localhost',
    DB_PORT: parseInt(process.env['DB_PORT']) || 5432,
    DB_USER: process.env['DB_USER'] || 'postgres',
    DB_PASSWORD: process.env['DB_PASSWORD'] || 'postgres',
    DB_NAME: process.env['DB_NAME'] || 'postgres',
    MONGODB_URL: process.env['DB_URL'] || 'mongodb://localhost:27017',
    MONGODB_NAME: process.env['DB_NAME'] || 'test',
    SYNCHRONIZE: process.env['DB_SYNCHRONIZE'] === 'true',
  },
  JWT: {
    SECRET: process.env['JWT_SECRET'] || 'your-secret-key',
    TOKEN_EXPIRY: process.env['JWT_TOKEN_EXPIRY'] || '1h',
    REFRESH_SECRET:
      process.env['JWT_REFRESH_SECRET'] || 'your-refresh-secret-key',
    REFRESH_EXPIRY: process.env['JWT_REFRESH_EXPIRY'] || '7d',
  },
  RATE_LIMIT: {
    TTL: process.env['RATE_LIMIT_TTL'] || 60,
    LIMIT: process.env['RATE_LIMIT_LIMIT'] || 100,
  },
  REDIS: {
    USERNAME: process.env['REDIS_USERNAME'] || '',
    PASSWORD: process.env['REDIS_PASSWORD'] || '',
    HOST: process.env['REDIS_HOST'] || 'localhost',
    PORT: parseInt(process.env['REDIS_PORT']) || 6379,
    USER_TTL: parseInt(process.env['REDIS_USER_TTL']) || 60 * 60 * 24 * 1000, // 1 hour in seconds
  },
  ENV: process.env['ENV'] || 'TEST',
};
