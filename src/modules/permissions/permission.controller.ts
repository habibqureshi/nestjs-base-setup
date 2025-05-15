import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { Permission } from './entities/permission.entity';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  async createPermission(@Body() permission: Permission) {
    return this.permissionService.create(permission);
  }

  @Get()
  async getAllPermissions() {
    return this.permissionService.findAll();
  }

  @Get(':id')
  async getPermissionDetail(@Param('id') id: number) {
    return this.permissionService.findById(id);
  }

  @Put(':id')
  async updatePermission(
    @Param('id') id: number,
    @Body() permission: Partial<Permission>,
  ) {
    return this.permissionService.update(id, permission);
  }

  @Delete(':id')
  async deletePermission(@Param('id') id: string) {
    return this.permissionService.delete(id);
  }
}
