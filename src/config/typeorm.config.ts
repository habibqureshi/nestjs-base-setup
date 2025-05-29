import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { APP_CONFIGS } from './app.config';
import { DataSourceOptions } from 'typeorm';
import { MongoConnectionOptions } from 'typeorm/driver/mongodb/MongoConnectionOptions';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

export const typeOrmConfig = (): TypeOrmModuleOptions => {
  const DB_TYPE = APP_CONFIGS.DB.TYPE || 'mysql';
  const commonOptions: Partial<DataSourceOptions> = {
    synchronize: APP_CONFIGS.DB.SYNCHRONIZE,
    logging: false,
    entities: [__dirname + '/../**/entities/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../db/migrations/**/*{.ts,.js}'],
  };

  let dbOptions: DataSourceOptions = {
    type: 'mysql',
    host: APP_CONFIGS.DB.DB_HOST,
    port: APP_CONFIGS.DB.DB_PORT,
    username: APP_CONFIGS.DB.DB_USER,
    database: APP_CONFIGS.DB.DB_NAME,
    password: APP_CONFIGS.DB.DB_PASSWORD,
    ...commonOptions,
  } as MysqlConnectionOptions;

  switch (DB_TYPE) {
    case 'postgres':
      dbOptions = {
        type: DB_TYPE,
        host: APP_CONFIGS.DB.DB_HOST,
        port: APP_CONFIGS.DB.DB_PORT,
        username: APP_CONFIGS.DB.DB_USER,
        database: APP_CONFIGS.DB.DB_NAME,
        password: APP_CONFIGS.DB.DB_PASSWORD,
        ...commonOptions,
      } as PostgresConnectionOptions;
      break;
    case 'mysql':
      dbOptions = {
        type: DB_TYPE,
        host: APP_CONFIGS.DB.DB_HOST,
        port: APP_CONFIGS.DB.DB_PORT,
        username: APP_CONFIGS.DB.DB_USER,
        database: APP_CONFIGS.DB.DB_NAME,
        password: APP_CONFIGS.DB.DB_PASSWORD,
        ...commonOptions,
      } as MysqlConnectionOptions;
      break;
    case 'mongodb':
      dbOptions = {
        type: DB_TYPE,
        url: APP_CONFIGS.DB.MONGODB_URL,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        database: APP_CONFIGS.DB.MONGODB_NAME,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
      } as MongoConnectionOptions;
      break;

    default:
      break;
  }

  return dbOptions;
};
