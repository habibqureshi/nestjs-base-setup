import { typeOrmConfig } from 'src/config/typeorm.config';
import { DataSource, DataSourceOptions } from 'typeorm';

export const AppDataSource = new DataSource(
  typeOrmConfig() as DataSourceOptions,
);
