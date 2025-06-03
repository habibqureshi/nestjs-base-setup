import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { PORTECTED_KEY } from 'src/config/decorator/protected.decorator';
import { IS_PUBLIC_KEY } from 'src/config/decorator/public.route.decorator';

@Injectable()
export class ClientAuthzGuard extends AuthGuard('basic') {
  constructor(private reflector: Reflector) {
    super();
  }

  override canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isProtected = this.reflector.getAllAndOverride<boolean>(
      PORTECTED_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isProtected) {
      return super.canActivate(context);
    }
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    return true;
  }
}
