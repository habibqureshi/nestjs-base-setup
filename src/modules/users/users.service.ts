import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IUser } from 'src/interfaces/user.interface';
import { User } from 'src/schemas/user.schema';
import { CustomLoggerService } from '../logger/logger.service';
import { CreateUserDto } from './dtos/create.user.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { use } from 'passport';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly logger: CustomLoggerService,
  ) {}

  async create(createUser: DeepPartial<User>): Promise<User> {
    if (createUser.password) {
      createUser.password = await bcrypt.hash(createUser.password, 10);
    }
    this.logger.log(`creating user ${JSON.stringify(createUser)}`);
    const newUser =  this.userRepository.create(createUser);
    this.logger.log(newUser)
    return await this.userRepository.save(newUser,{reload:true});
  }

  async findAll(params: any): Promise<Array<User> | null> {
    const {limit=10,offset=0 , where = {}} = params
    const  [result, total] =  await this.userRepository
      .findAndCount({
        where,
        skip:offset,
        take:limit
      })
      this.logger.log( `total users ${total}`)
      return result
      
  }

  async findOne(params: any): Promise<User | null> {
    this.logger.log(`finding user with params ${JSON.stringify(params)}`);
    const user: User = await this.userRepository
      .findOne({where:params, relations: {
        roles:{
          permissions:true
        }
      },})
  
    if (!user) {
      this.logger.log(`user not found`);
      throw new BadRequestException(`User Not found`);
    }
    this.logger.log(`user found ${JSON.stringify(user)}`);
    return user;
  }
}
