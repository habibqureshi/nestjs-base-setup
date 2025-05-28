import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { BaseService } from 'src/common/base.service';

@Injectable()
export class PermissionService extends BaseService<Permission> {
  constructor(
    @InjectRepository(Permission)
    private readonly repo: Repository<Permission>,
  ) {
    super(repo);
  }

  async create(permission: Partial<Permission>): Promise<Permission> {
    return this.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return this.repo.find();
  }

  async findById(id: number): Promise<Permission> {
    const permission = await this.findOneOrNull({ where: { id } });
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return permission;
  }

  async update(
    id: number,
    permission: Partial<Permission>,
  ): Promise<Permission> {
    await this.repo.update(id, permission);
    const updatedPermission = await this.repo.findOneBy({ id });
    if (!updatedPermission) {
      throw new NotFoundException('Permission not found');
    }
    return updatedPermission;
  }

  async delete(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Permission not found');
    }
  }
}
