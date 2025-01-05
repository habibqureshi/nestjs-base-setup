import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { APP_CONFIGS } from './app.config';
import { Logger } from '@nestjs/common';

const logger = new Logger('DatabaseConfig'); // Create a new Logger instance for database configuration

export const typeOrmConfig = (): TypeOrmModuleOptions => {
  const isMySQL = APP_CONFIGS.DB.TYPE === 'mysql';

  // Log the connection information
  if (isMySQL) {
    logger.log(`Connecting to MySQL with the following credentials:
      Host: ${APP_CONFIGS.DB.MYSQL_HOST}
      Port: ${APP_CONFIGS.DB.MYSQL_PORT}
      Database: ${APP_CONFIGS.DB.MYSQL_NAME}`);
  } else {
    logger.log(`Connecting to MongoDB with the following credentials:
      URL: ${APP_CONFIGS.DB.MONGODB_URL}
      Database: ${APP_CONFIGS.DB.MONGODB_NAME}`);
  }


  return  {
    type: isMySQL ? 'mysql' : 'mongodb',
    host: isMySQL ? APP_CONFIGS.DB.MYSQL_HOST : undefined, // Use MySQL host; undefined for MongoDB
    port: isMySQL ? APP_CONFIGS.DB.MYSQL_PORT : undefined, // Use MySQL port; undefined for MongoDB
    username: isMySQL ? APP_CONFIGS.DB.MYSQL_USER : undefined, // Use MySQL user; undefined for MongoDB
    password: isMySQL ? APP_CONFIGS.DB.MYSQL_PASSWORD : undefined, // Use MySQL password; undefined for MongoDB
    database: isMySQL ? APP_CONFIGS.DB.MYSQL_NAME : APP_CONFIGS.DB.MONGODB_NAME, // Set appropriate database name
    url: isMySQL ? undefined : APP_CONFIGS.DB.MONGODB_URL, // Use MongoDB URL if applicable
    synchronize: APP_CONFIGS.DB.SYNCHRONIZE, // Synchronization option for TypeORM
    entities: [__dirname + '/../**/*.schema{.ts,.js}'], // Entities location
    useUnifiedTopology: true, // MongoDB specific option
    ...(isMySQL ? {} : { useNewUrlParser: true }), // MongoDB specific option
    "logging": true
  };

};
