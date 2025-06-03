import { Injectable, Logger } from '@nestjs/common';
import { extractStack } from 'src/common/utils/logger-helper';
import { EntityManager } from 'typeorm';

@Injectable()
export class ClientsService {
  logger: Logger = new Logger(ClientsService.name);

  constructor(private entityManager: EntityManager) {}

  async run() {
    try {
      await this.entityManager.query(
        `INSERT INTO app_clients ( "clientId", "clientSecret", name, description) VALUES ('abc', '$2a$12$AFP5CdIB0Cq1hViCIx20quX5Sss7FfVyCyXyQgCJs7xEAuQ3gaUDy', 'Default App Client', 'Default application client for basic authentication')  ON CONFLICT (id) DO NOTHING`,
      );
      this.logger.debug('seeding clients successfully!');
    } catch (error) {
      this.logger.error('error while seeding clients', extractStack(error));
    }
  }
}
