import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { PermissionsService } from './permissions/permissions.service';
import { RolesService } from './roles/roles.service';
import { ClientsService } from './clients/clients.service';
import { UsersService } from './users/users.service';
import { CommonService } from './common/common.service';

const run = async () => {
  const app = await NestFactory.createApplicationContext(SeedModule);
  await app.get(PermissionsService).run();
  await app.get(RolesService).run();
  await app.get(ClientsService).run();
  await app.get(UsersService).run();
  await app.get(CommonService).run();
  await app.close();
};

run();
