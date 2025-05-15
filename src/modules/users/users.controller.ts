import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  Query,
  ConflictException,
} from '@nestjs/common';
import { CustomLoggerService } from '../logger/logger.service';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    readonly userService: UsersService,
    private readonly logger: CustomLoggerService,
  ) {}

  @Get()
  async getAllUsers(
    @Res() response: Response,
    @Query('total') total: number = 10,
    @Query('offset') offset: number = 0,
    @Query('name') name?: string,
    @Query('email') email?: string,
  ) {
    const users: Array<User> = await this.userService.findAll({
      limit: total,
      offset,
      where: {
        name,
        email,
      },
    });
    return response.status(HttpStatus.OK).json({
      message: 'All users',
      user: users,
    });
  }

  @Post()
  async addUser(@Res() response: Response, @Body() userDTO: User) {
    try {
      this.logger.log(`user data ${JSON.stringify(userDTO)}`);
      const newUser = await this.userService.create(userDTO);
      this.logger.log(`new user ${newUser}`);
      return response.status(HttpStatus.CREATED).json({
        message: 'New user created successfully',
        user: newUser,
      });
    } catch (err) {
      this.logger.log(`err ${err}`);
      const errorMessage = 'Error: User not created!';
      if (err instanceof QueryFailedError) {
        const error = err as QueryFailedError & {
          code?: string;
          errno?: number;
        };
        if (error.code === '23505') {
          throw new ConflictException('Duplicate entry');
        }
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
          throw new ConflictException('Duplicate entry');
        }
      }
      if ((err as any).code == 11000)
        throw new ConflictException('Already exist!');
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: errorMessage,
        error: 'Bad Request',
      });
    }
  }
}
