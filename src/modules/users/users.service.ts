import { CustomLoggerService } from '../logger/logger.service';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { BaseService } from 'src/common/base.service';
import { CreateUser } from 'src/common/types/user.types';
import { RoleService } from '../roles/roles.service';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    repo: Repository<User>,
    private readonly logger: CustomLoggerService,
    private readonly roleService: RoleService,
  ) {
    super(repo);
  }

  async create(createUser: CreateUser): Promise<User> {
    createUser.password = await bcrypt.hash(createUser.password, 10);

    this.logger.log(`creating user ${JSON.stringify(createUser)}`);
    let roles = [];
    if (createUser.roles.length > 0) {
      roles = await this.roleService.findMany({
        where: { id: In(createUser.roles) },
      });
    }
    const createdUser = await this.save({ ...createUser, roles });
    return createdUser;
  }
}
