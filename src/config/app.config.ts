import * as dotenv from 'dotenv';

dotenv.config({
  path: process.cwd() + '/.dev.env',
});

console.debug(
  `Using environment configuration from: ${process.cwd()}/.dev.env`,
);

export const APP_CONFIGS = {
  DB: {
    TYPE: process.env.DB_TYPE || 'mongodb', // 'mysql' or 'mongodb'
    MYSQL_HOST:
      process.env.DB_TYPE === 'mysql'
        ? process.env.MYSQL_HOST || 'localhost'
        : 'localhost', // MySQL host
    MYSQL_PORT:
      process.env.DB_TYPE === 'mysql'
        ? Number(process.env.MYSQL_PORT) || 3306
        : 3306, // MySQL port
    MYSQL_USER:
      process.env.DB_TYPE === 'mysql'
        ? process.env.MYSQL_USER || 'root'
        : 'root', // MySQL user
    MYSQL_PASSWORD:
      process.env.DB_TYPE === 'mysql' ? process.env.MYSQL_PASSWORD || '' : '', // MySQL password
    MYSQL_NAME:
      process.env.DB_TYPE === 'mysql'
        ? process.env.MYSQL_DB_NAME || 'test'
        : 'test', // MySQL database name
    MONGODB_URL:
      process.env.DB_TYPE === 'mongodb'
        ? process.env.DB_URL || 'mongodb://localhost:27017'
        : '', // MongoDB URL
    MONGODB_NAME:
      process.env.DB_TYPE === 'mongodb' ? process.env.DB_NAME || 'test' : '', // MongoDB database name
    SYNCHRONIZE: process.env.DB_SYNCHRONIZE === 'true', // Synchronization option for TypeORM
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'MY_SECRET',
    TOKEN_EXPIRY: process.env.JWT_EXPIRY || '12h',
  },
  RATE_LIMIT:{
    TTL:process.env.RL_TTL || 60000,
    LIMIT:process.env.RL_LIMIT || 100

  },
  ENV: process.env.ENV || 'TEST',
};
