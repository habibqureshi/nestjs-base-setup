import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/base.service';
import { UserLogin } from './entities/user-login.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomLoggerService } from '../logger/logger.service';
import { User } from '../users/entities/user.entity';
import { Request } from 'express';

@Injectable()
export class UserLoginService extends BaseService<UserLogin> {
  constructor(
    @InjectRepository(UserLogin)
    private readonly repo: Repository<UserLogin>,
    private readonly logger: CustomLoggerService,
  ) {
    super(repo);
  }

  async create(req: Request, user: User): Promise<UserLogin> {
    this.logger.log(`Creating user login for user ${user.id}`);
    return this.save({
      ipAddress:
        req.ip ||
        (req.headers?.['x-forwarded-for']
          ? Array.isArray(req.headers['x-forwarded-for'])
            ? req.headers['x-forwarded-for'][0]
            : req.headers['x-forwarded-for']
          : '') ||
        '',
      userAgent:
        req.headers?.['user-agent'] ||
        (req.headers?.['x-user-agent']
          ? Array.isArray(req.headers['x-user-agent'])
            ? req.headers['x-user-agent'][0]
            : req.headers['x-user-agent']
          : '') ||
        '',
      user,
      provider: 'email',
    });
  }
}
