import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post, Res } from '@nestjs/common';
import { IUser } from 'src/interfaces/user.interface';
import { CustomLoggerService } from '../logger/logger.service';
import { CreateUserDto } from './dtos/create.user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(readonly userService:UsersService,private readonly logger:CustomLoggerService){}

    @Get()
    async getAllUsers(@Res() response){
       const  allUsers:Array<IUser> = await this.userService.findAll({});
        return response.status(HttpStatus.OK).json({
            message:"All users",
            user:allUsers
        })

    }

    @Post()
    async addUser(@Res() response,@Body() userDTO:CreateUserDto) {
        try{
            this.logger.log(`user data ${JSON.stringify(userDTO)}`);
            const newUser = await this.userService.create(userDTO)
            return response.status(HttpStatus.CREATED).json({
            message:"New user created successfully",
            user:newUser
        })

        }
        catch (err) {
            this.logger.log(err);
            return response.status(HttpStatus.BAD_REQUEST).json({
            statusCode: 400,
            message: 'Error: User not created!',
            error: 'Bad Request'
         });
         }
        
       
      }
    
}
