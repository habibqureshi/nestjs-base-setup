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
import { Role } from 'src/schemas/role.schema';
import { RoleService } from './roles.service';


@Controller('roles')
export class RolesController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  async createRole(@Body() role: Partial<Role>) {
    return this.roleService.create(role);
  }

  @Get()
  async getRoles(@Query('name') name?: string) {
    return this.roleService.findAll(name);
  }

  @Get(':id')
  async getRoleDetail(@Param('id') id: string) {
    return this.roleService.findById(id);
  }

  @Put(':id')
  async updateRole(@Param('id') id: string, @Body() role: Partial<Role>) {
    return this.roleService.update(id, role);
  }

  @Delete(':id')
  async deleteRole(@Param('id') id: string) {
    return this.roleService.delete(id);
  }
}
