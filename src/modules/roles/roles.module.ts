import { Module } from '@nestjs/common';
import { RoleService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [RolesController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RolesModule {}
