import { Module } from '@nestjs/common';
import { Role } from 'src/schemas/role.schema';
import { RoleService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
 
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [RolesController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RolesModule {}
