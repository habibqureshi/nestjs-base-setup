import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { BaseService } from 'src/common/base.service';
import { CreateRoleZod, UpdateRoleZod } from 'src/common/types/role.types';
import { PermissionService } from '../permissions/permission.service';

@Injectable()
export class RoleService extends BaseService<Role> {
  constructor(
    @InjectRepository(Role)
    private readonly repo: Repository<Role>,
    private readonly permissionService: PermissionService,
  ) {
    super(repo);
  }

  async create(role: CreateRoleZod): Promise<Role> {
    let permissions = [];
    if (role.permissions.length > 0) {
      permissions = await this.permissionService.findMany({
        where: { id: In(role.permissions) },
      });
    }
    return this.save({ ...role, permissions });
  }

  async update(id: number, role: UpdateRoleZod): Promise<Role> {
    const existingRole = await this.repo.findOne({ where: { id } });
    if (!existingRole) {
      throw new NotFoundException('Role not found');
    }
    let permissions = existingRole.permissions;
    if (role.permissions.length > 0) {
      permissions = await this.permissionService.findMany({
        where: { id: In(role.permissions) },
      });
    }
    Object.assign(existingRole, { ...role, permissions }); // Update the existing role with new data
    return this.repo.save(existingRole); // Save the updated role
  }

  async delete(id: number): Promise<void> {
    const result = await this.softDeleteById(id); // Use TypeORM's delete method
    if (!result || result.affected === 0) {
      throw new NotFoundException('Role not found');
    }
  }
}
