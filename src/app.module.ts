import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { RequestContextModule } from 'nestjs-request-context';
import { AuthModule } from './modules/auth/auth.module';
import { LoggerModule } from './modules/logger/logger.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionModule } from './modules/permissions/permissions.module';
import { typeOrmConfig } from './config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestIdMiddleware } from './config/middlewares/mw.request.id';
import { APP_CONFIGS } from './config/app.config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { RedisModule } from './modules/redis/redis.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';

@Module({
  imports: [
    AuthModule,
    RequestContextModule,
    CacheModule.register({
      isGlobal: true,
      stores: [
        new KeyvRedis({
          username: APP_CONFIGS.REDIS.USERNAME,
          password: APP_CONFIGS.REDIS.PASSWORD,
          socket: {
            host: APP_CONFIGS.REDIS.HOST,
            port: APP_CONFIGS.REDIS.PORT,
          },
        }),
      ],
    }),
    TypeOrmModule.forRoot(typeOrmConfig()),
    ThrottlerModule.forRoot([
      {
        ttl: +APP_CONFIGS.RATE_LIMIT.TTL,
        limit: +APP_CONFIGS.RATE_LIMIT.LIMIT,
      },
    ]),
    UsersModule,
    LoggerModule,
    RolesModule,
    PermissionModule,
    RedisModule,
  ],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthorizationGuard,
    // },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
