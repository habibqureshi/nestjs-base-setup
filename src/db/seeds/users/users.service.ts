import { Injectable, Logger } from '@nestjs/common';
import { extractStack } from 'src/common/utils/logger-helper';
import { EntityManager } from 'typeorm';

@Injectable()
export class UsersService {
  logger: Logger = new Logger(UsersService.name);
  constructor(private entityManager: EntityManager) {}

  async run() {
    try {
      await this.entityManager.query(
        `INSERT INTO users (id, name, email, enable, deleted, password) VALUES (1, 'admin', 'admin@example.com', TRUE, FALSE, '$2b$10$Ajmy2rO83s7er2lM5.NlweY9P8UsNrPgBEOidKiauRyAyHRAXsKoS')  ON CONFLICT (id) DO NOTHING`,
      );
      this.logger.debug('user seeding completed');
    } catch (error) {
      this.logger.error('error while seeding user', extractStack(error));
    }
  }
}
