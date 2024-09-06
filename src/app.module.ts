import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestIdMiddleware } from './configs/middlewares/mw.request.id';
import { RequestContextModule, RequestContextMiddleware } from 'nestjs-request-context';
import { AuthModule } from './modules/auth/auth.module';
import { LoggerModule } from './modules/logger/logger.module';
import { JwtStrategy } from './modules/auth/jwt.strategy';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthInterceptor } from './configs/interceptors/auth.interceptor';
import { AuthorizationGuard } from './modules/auth/authrization.guard';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    RequestContextModule,
    MongooseModule.forRoot('mongodb://localhost:27017',{dbName: 'translation'}),
    ConfigModule.forRoot({
      envFilePath: '.local.env',
      isGlobal: true,
      // envFilePath: '.prod.env',
    }),
    UsersModule, 
    JobsModule, AuthModule, LoggerModule, RolesModule, PermissionsModule],
    providers:[
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
      provide: APP_INTERCEPTOR,
      useClass: AuthInterceptor,
    },
    ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.
    apply(RequestIdMiddleware)
    .forRoutes("*")
  }
}
