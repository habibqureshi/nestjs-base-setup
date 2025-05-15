import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { RoleService } from './roles.service';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { FilterRoleDto } from './dto/filter-role.dto';

@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  async createRole(@Body() role: CreateRoleDto) {
    return this.roleService.create(role);
  }

  @Get()
  async getRoles(@Query() filters: FilterRoleDto): Promise<Role[]> {
    return this.roleService.findAll(filters.name);
  }

  @Get(':id')
  async getRoleDetail(@Param('id') id: number) {
    return this.roleService.findById(id);
  }

  @Put(':id')
  async updateRole(@Param('id') id: number, @Body() role: Partial<Role>) {
    return this.roleService.update(id, role);
  }

  @Delete(':id')
  async deleteRole(@Param('id') id: string) {
    return this.roleService.delete(id);
  }
}
