import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  Query,
} from '@nestjs/common';
import { Public } from 'src/config/decorator/public.route.decorator';
import { CustomLoggerService } from '../logger/logger.service';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ApiSecurity } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(
    readonly userService: UsersService,
    private readonly logger: CustomLoggerService,
  ) {}

  @ApiSecurity('bearer')
  @Get()
  async getAllUsers(
    @Res() response,
    @Query('total') total: number = 10,
    @Query('offset') offset: number = 0,
    @Query('name') name: string,
    @Query('email') email: string,
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

  @Public()
  @Post()
  async addUser(@Res() response, @Body() userDTO: User) {
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
      let errorMessage = 'Error: User not created!';
      const MONGO_DUPLICATE_ENTRY_ERROR_CODE = 11000;
      const MYSQL_DUPLICATE_ENTRY_ERROR_CODE = 1062;
      if (err.code && err.code == MONGO_DUPLICATE_ENTRY_ERROR_CODE)
        errorMessage = err.writeErrors[0].errmsg.split(':')[2];
      else if (err.errno && err.errno == MYSQL_DUPLICATE_ENTRY_ERROR_CODE)
        errorMessage = err.sqlMessage.split('for key')[0];
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: errorMessage,
        error: 'Bad Request',
      });
    }
  }
}
