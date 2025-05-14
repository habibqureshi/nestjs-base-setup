import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(permission: Partial<Permission>): Promise<Permission> {
    const newPermission = this.permissionRepository.create(permission);
    return this.permissionRepository.save(newPermission);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  async findById(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOneBy({ id });
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return permission;
  }

  async update(
    id: number,
    permission: Partial<Permission>,
  ): Promise<Permission> {
    await this.permissionRepository.update(id, permission);
    const updatedPermission = await this.permissionRepository.findOneBy({ id });
    if (!updatedPermission) {
      throw new NotFoundException('Permission not found');
    }
    return updatedPermission;
  }

  async delete(id: string): Promise<void> {
    const result = await this.permissionRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Permission not found');
    }
  }
}
