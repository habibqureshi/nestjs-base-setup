import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { Permission } from 'src/schemas/permission.schema';
import { PermissionService } from './permission.service';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  async createPermission(@Body() permission: Partial<Permission>) {
    return this.permissionService.create(permission);
  }

  @Get()
  async getAllPermissions() {
    return this.permissionService.findAll();
  }

  @Get(':id')
  async getPermissionDetail(@Param('id') id: string) {
    return this.permissionService.findById(id);
  }

  @Put(':id')
  async updatePermission(
    @Param('id') id: string,
    @Body() permission: Partial<Permission>,
  ) {
    return this.permissionService.update(id, permission);
  }

  @Delete(':id')
  async deletePermission(@Param('id') id: string) {
    return this.permissionService.delete(id);
  }
}
