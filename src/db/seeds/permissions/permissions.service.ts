import { Injectable, Logger } from '@nestjs/common';
import { extractStack } from 'src/common/utils/logger-helper';
import { EntityManager } from 'typeorm';

@Injectable()
export class PermissionsService {
  logger: Logger = new Logger(PermissionsService.name);
  constructor(private readonly entityManager: EntityManager) {}

  async run() {
    try {
      await this.entityManager.query(
        `INSERT INTO permissions (id, name, url, regex) VALUES (1, 'root', '*', '*') ON CONFLICT (id) DO NOTHING`,
      );
      this.logger.debug('permission seeding completed');
    } catch (error) {
      this.logger.error('error while seeding permission', extractStack(error));
    }
  }
}
