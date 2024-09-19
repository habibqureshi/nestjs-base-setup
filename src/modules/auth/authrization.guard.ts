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
    // console.log('can active authorization guard',currentUser)
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]); // same thing we can do for protected routes as well
    // console.log(context.getClass())
    // console.log(context.getHandler().name)
    if (isPublic) {
      return true;
    } else {
      // console.log(`current user in authrization guard 2 ${JSON.stringify(currentUser.userId.roles)}`)
      //check user role and permission
    }
    return true;

    //   const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
    //     context.getHandler(),
    //     context.getClass(),
    //   ]);
    //   if (isPublic) {
    //     return true;
    //   }
    //   console.log('return false')
    //   return super.canActivate(context);
  }
}
