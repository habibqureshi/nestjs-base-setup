import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppClient } from './entities/app-client.entity';
import { BaseService } from 'src/common/base.service';

@Injectable()
export class AppClientService extends BaseService<AppClient> {
  constructor(
    @InjectRepository(AppClient)
    private repo: Repository<AppClient>,
  ) {
    super(repo);
  }
}
