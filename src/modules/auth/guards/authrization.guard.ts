import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { PORTECTED_KEY } from 'src/config/decorator/protected.decorator';
import { IS_PUBLIC_KEY } from 'src/config/decorator/public.route.decorator';
import { IUser } from 'src/interfaces/user.interface';
import { CustomLoggerService } from 'src/modules/logger/logger.service';

@Injectable()
export class AuthorizationGuard extends AuthGuard('jwt') {
  logger: CustomLoggerService;
  constructor(private reflector: Reflector) {
    super();
    this.logger = new CustomLoggerService();
  }

  override canActivate(context: ExecutionContext) {
    const req: Request = context.switchToHttp().getRequest();
    const currentUser: IUser = req.user;
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const isProtected = this.reflector.getAllAndOverride<boolean>(
      PORTECTED_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isProtected) {
      return true;
    }

    const hasPermission =
      currentUser.permissions[req.method + ':' + req.url] ||
      currentUser.permissions['*'];

    if (hasPermission) {
      this.logger.debug(
        'user have permission for this endpoint',
        req.method + ':' + req.url,
      );
      return true;
    } else {
      this.logger.debug(
        'user dont have permission for this endpoint',
        req.method + ':' + req.url,
      );
      return false;
    }
  }
}
