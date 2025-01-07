import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './../../schemas/role.schema';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(role: Partial<Role>): Promise<Role> {
    const newRole = this.roleRepository.create(role); // Create a new Role entity instance
    return this.roleRepository.save(newRole); // Save the new role
  }

  async findAll(name?: string): Promise<Role[]> {
    const filter: any = {};

    if (name) {
      filter.name = name;
    }
    return this.roleRepository.find({
      where: filter,
      select: ['id', 'name', , 'permissions'], // Select specific fields
    });
  }

  async findById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id } }); // Use TypeORM's findOne method
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async update(id: string, role: Partial<Role>): Promise<Role> {
    const existingRole = await this.roleRepository.findOne({ where: { id } });
    if (!existingRole) {
      throw new NotFoundException('Role not found');
    }

    Object.assign(existingRole, role); // Update the existing role with new data
    return this.roleRepository.save(existingRole); // Save the updated role
  }

  async delete(id: string): Promise<void> {
    const result = await this.roleRepository.delete(id); // Use TypeORM's delete method
    if (result.affected === 0) {
      throw new NotFoundException('Role not found');
    }
  }
}
