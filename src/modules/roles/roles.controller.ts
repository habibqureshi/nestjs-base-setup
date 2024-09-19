import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import { CustomLoggerService } from '../logger/logger.service';
import { RoleService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(
    private readonly roleService: RoleService,
    private readonly logger: CustomLoggerService,
  ) {}

  @Get('/')
  async GetAllRoles(@Res() response) {
    try {
      const allRoles = await this.roleService.getAll({});
      return response.status(HttpStatus.OK).json({
        message: 'Roles',
        data: allRoles,
      });
    } catch (err) {
      this.logger.log(err);
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: 'Error: User while getting Roles!',
        error: 'Bad Request',
      });
    }
  }
}
