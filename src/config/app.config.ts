import * as dotenv from 'dotenv';

dotenv.config({
  path: process.cwd() + '/.env',
});

console.debug(`Using environment configuration from: ${process.cwd()}/.env`);

export const APP_CONFIGS = {
  DB: {
    TYPE: process.env.DB_TYPE || 'mongodb', // 'mysql' or 'mongodb'
    DB_HOST: process.env.DB_HOST || 'localhost', // MySQL host
    DB_PORT: Number(process.env.DB_PORT) || 3306, // MySQL port
    DB_USER: process.env.DB_USER || 'root', // MySQL user
    DB_PASSWORD: process.env.DB_PASSWORD || '', // MySQL password
    DB_NAME: process.env.DB_NAME || 'test', // MySQL database name
    MONGODB_URL: process.env.DB_URL || 'mongodb://localhost:27017', // MongoDB URL
    MONGODB_NAME: process.env.DB_NAME || 'test', // MongoDB database name
    SYNCHRONIZE: process.env.DB_SYNCHRONIZE === 'true', // Synchronization option for TypeORM
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'MY_SECRET',
    TOKEN_EXPIRY: process.env.JWT_EXPIRY || '12h',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'MY_REFRESH_SECRET',
    REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  RATE_LIMIT: {
    TTL: process.env.RL_TTL || 60000,
    LIMIT: process.env.RL_LIMIT || 100,
  },
  ENV: process.env.ENV || 'TEST',
};
