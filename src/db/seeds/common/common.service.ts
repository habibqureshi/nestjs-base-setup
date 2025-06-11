import { Injectable, Logger } from '@nestjs/common';
import { extractStack } from 'src/common/utils/logger-helper';
import { EntityManager } from 'typeorm';

@Injectable()
export class CommonService {
  logger: Logger = new Logger(CommonService.name);
  constructor(private entityManager: EntityManager) {}

  async run() {
    try {
      await this.entityManager.query(
        `INSERT INTO role_permission (role_id, permission_id) VALUES (1, 1)  ON CONFLICT (role_id, permission_id) DO NOTHING`,
      );
      await this.entityManager.query(
        `INSERT INTO user_roles (role_id, user_id) VALUES (1, 1) ON CONFLICT (role_id, user_id) DO NOTHING`,
      );
      this.logger.debug('seeding common successfull');
    } catch (error) {
      this.logger.error('error while seeding common', extractStack(error));
    }
  }
}
