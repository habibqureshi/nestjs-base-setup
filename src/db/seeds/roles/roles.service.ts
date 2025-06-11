import { Injectable, Logger } from '@nestjs/common';
import { extractStack } from 'src/common/utils/logger-helper';
import { EntityManager } from 'typeorm';

@Injectable()
export class RolesService {
  logger: Logger = new Logger(RolesService.name);
  constructor(private readonly entityManager: EntityManager) {}
  async run() {
    try {
      await this.entityManager.query(
        `INSERT INTO roles (id, name, enable, deleted) VALUES (1, 'root', TRUE, FALSE) ON CONFLICT (id) DO NOTHING`,
      );
      this.logger.debug('roles seeding completed successfully!');
    } catch (error) {
      this.logger.error('error while seeding roles', extractStack(error));
    }
  }
}
