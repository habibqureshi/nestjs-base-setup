import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/config/decorator/public.route.decorator';
import { IUser } from 'src/interfaces/user.interface';

@Injectable()
export class AuthorizationGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  override canActivate(context: ExecutionContext) {
    const req: Request = context.switchToHttp().getRequest();
    const currentUser: IUser = req.user;
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const hasPermission =
      isPublic ||
      currentUser.permissions[req.method + ':' + req.url] ||
      currentUser.permissions['*'];

    if (hasPermission) {
      console.debug(
        'user have permission for this endpoint',
        req.method + ':' + req.url,
      );
      return true;
    } else {
      console.debug(
        'user dont have permission for this endpoint',
        req.method + ':' + req.url,
      );
      return false;
    }
  }
}
