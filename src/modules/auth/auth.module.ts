import { Module, Scope } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { APP_CONFIGS } from 'src/config/app.config';
import { JwtRefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { BasicStrategy } from './strategies/basic.strategy';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthorizationGuard } from './guards/authrization.guard';
import { RedisModule } from '../redis/redis.module';
import { AppClientModule } from '../app-client/app-client.module';
import { BearerTokenInterceptor } from 'src/config/interceptors/bearer-token.interceptor';
import { UserLoginModule } from '../user-login/user-login.module';

@Module({
  imports: [
    PassportModule.register({ session: false }),
    JwtModule.register({
      secret: APP_CONFIGS.JWT.SECRET,
      signOptions: { expiresIn: APP_CONFIGS.JWT.TOKEN_EXPIRY },
    }),
    UsersModule,
    RedisModule,
    AppClientModule,
    UserLoginModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    JwtRefreshTokenStrategy,
    BasicStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: AuthorizationGuard },
    {
      provide: APP_INTERCEPTOR,
      scope: Scope.REQUEST,
      useClass: BearerTokenInterceptor,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
