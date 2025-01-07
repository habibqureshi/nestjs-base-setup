import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/config/decorator/public.route.decorator';

@Injectable()
export class AuthorizationGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const currentUser = req.user;
    // console.log('can active authorization guard', currentUser);
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // if endpoint is public or user have permission for exact endpoint or user have super admin permission then is will allow to access
    if (
      isPublic ||
      currentUser?.permissions[req.method + ':' + req.url] ||
      currentUser?.permissions['*']
    ) {
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
