import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Public } from 'src/config/decorator/public.route.decorator';
import { IUser } from 'src/interfaces/user.interface';
import { User } from 'src/schemas/user.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CustomLoggerService } from '../logger/logger.service';
import { CreateUserDto } from './dtos/create.user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(
    readonly userService: UsersService,
    private readonly logger: CustomLoggerService,
  ) {}

  @Get()
  async getAllUsers(@Res() response) {
    const users: Array<User> = await this.userService.findAll({});
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
      this.logger.log(`new user ${newUser}`)
      return response.status(HttpStatus.CREATED).json({
        message: 'New user created successfully',
        user: newUser,
      });
    } catch (err) {
      this.logger.log(`err ${err}`);
      let errorMessage = "Error: User not created!"
      const MONGO_DUPLICATE_ENTRY_ERROR_CODE  = 11000
      const MYSQL_DUPLICATE_ENTRY_ERROR_CODE = 1062
      console.log(typeof(err))
      console.log(Object.keys(err));
      console.log("Values:", Object.values(err));
      console.log(err.errno)


      if(err.code && err.code == MONGO_DUPLICATE_ENTRY_ERROR_CODE )
        errorMessage = err.writeErrors[0].errmsg.split(":")[2]

      else if(err.errno && err.errno == MYSQL_DUPLICATE_ENTRY_ERROR_CODE  )
        errorMessage = err.sqlMessage.split("for key")[0]

      
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: errorMessage,
        error: 'Bad Request',
      });
    }
  }
}
