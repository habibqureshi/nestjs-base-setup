import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IUser } from 'src/interfaces/user.interface';
import { User } from 'src/schemas/user.schema';
import { CustomLoggerService } from '../logger/logger.service';
import { CreateUserDto } from './dtos/create.user.dto';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel:Model<IUser>,private readonly logger:CustomLoggerService){}

    async create(createUser:CreateUserDto):Promise<IUser>{
        if(createUser.password){
            createUser.password= await bcrypt.hash(createUser.password, 10);

        }
        this.logger.log(`creating user ${JSON.stringify(createUser)}`)
        const createdUser = new this.userModel(createUser);
        return createdUser.save()

    }

    async findAll(params:any):Promise<Array<IUser> | null>{
        return await this.userModel.
        find()
        .populate({
            path: 'roles',
            populate: {
                path: 'permissions'
            }, 
             
        })
        .exec()
    }

    async findOne(params:any):Promise<IUser | null>{
        this.logger.log(`finding user with params ${JSON.stringify(params)}`);
        const user:IUser = await this.userModel.
        findOne(params)
        .populate({
            path: 'roles',
            populate: {
                path: 'permissions'
            }, 
             
        })
        .exec();
        if(!user){
            this.logger.log(`user not found`)
            throw new BadRequestException(`User Not found`)
        }
        this.logger.log(`user found ${JSON.stringify(user)}`)
        return user;
    }

}
