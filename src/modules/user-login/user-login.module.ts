import { Module } from '@nestjs/common';
import { UserLoginService } from './user-login.service';
import { UserLoginController } from './user-login.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLogin } from './entities/user-login.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserLogin])],
  providers: [UserLoginService],
  controllers: [UserLoginController],
  exports: [UserLoginService],
})
export class UserLoginModule {}
