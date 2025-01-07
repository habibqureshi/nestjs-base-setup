import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { APP_CONFIGS } from 'src/config/app.config';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    JwtModule.register({
      secret: APP_CONFIGS.JWT.SECRET,
      signOptions: { expiresIn: APP_CONFIGS.JWT.TOKEN_EXPIRY },
    }),
  ],

  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
