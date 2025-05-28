import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppClient } from './entities/app-client.entity';
import { AppClientService } from './app-client.service';

@Module({
  imports: [TypeOrmModule.forFeature([AppClient])],
  providers: [AppClientService],
  exports: [AppClientService],
})
export class AppClientModule {}
