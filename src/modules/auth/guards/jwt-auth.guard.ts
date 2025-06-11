import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { PORTECTED_KEY } from 'src/config/decorator/protected.decorator';
import { IS_PUBLIC_KEY } from 'src/config/decorator/public.route.decorator';
import { UnauthorizedErrorInterceptor } from 'src/config/interceptors/unauthorized.interceptor';
import { IUser } from 'src/interfaces/user.interface';

interface ErrorResponse {
  response?: {
    errors?: string[];
  };
}

interface AuthInfo {
  message?: string;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  override canActivate(
    context: ExecutionContext,
  ): Promise<boolean> | boolean | Observable<boolean> {
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
    return super.canActivate(context);
  }

  override handleRequest<TUser = IUser>(
    err: ErrorResponse | null,
    user: TUser | null,
    info: AuthInfo,
    _: ExecutionContext,
  ): TUser {
    if (err || !user) {
      throw new UnauthorizedErrorInterceptor([
        err?.response?.errors?.[0] || info.message || 'Unauthorized access',
      ]);
    }
    return user;
  }
}
