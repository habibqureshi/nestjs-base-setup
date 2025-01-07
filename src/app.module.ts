import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { RequestContextModule } from 'nestjs-request-context';
import { AuthModule } from './modules/auth/auth.module';
import { LoggerModule } from './modules/logger/logger.module';
import { JwtStrategy } from './modules/auth/jwt.strategy';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthorizationGuard } from './modules/auth/authrization.guard';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionModule } from './modules/permissions/permissions.module';
import { typeOrmConfig } from './config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestIdMiddleware } from './config/middlewares/mw.request.id';
import { APP_CONFIGS } from './config/app.config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
@Module({
  imports: [
    RequestContextModule,
    TypeOrmModule.forRoot(typeOrmConfig()),
    ThrottlerModule.forRoot([
      {
        ttl: +APP_CONFIGS.RATE_LIMIT.TTL,
        limit: +APP_CONFIGS.RATE_LIMIT.LIMIT,
      },
    ]),
    UsersModule,
    AuthModule,
    LoggerModule,
    RolesModule,
    PermissionModule,
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
