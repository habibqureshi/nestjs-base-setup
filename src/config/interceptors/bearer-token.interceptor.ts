import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { Request } from 'express';
import { AuthService } from 'src/modules/auth/auth.service';
import { UnauthorizedErrorInterceptor } from './unauthorized.interceptor';
import { CustomLoggerService } from 'src/modules/logger/logger.service';

@Injectable()
export class BearerTokenInterceptor implements NestInterceptor {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: CustomLoggerService,
  ) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    const auth = authHeader?.split(' ');

    if (auth[0] === 'Bearer' && auth[1]) {
      const isBlocked = await this.authService.isBlocked(auth[1]);
      if (isBlocked) {
        this.logger.debug('blocked token ' + auth[1]);
        return throwError(
          () => new UnauthorizedErrorInterceptor(['Token has been revoked']),
        );
      }
    }

    return next.handle();
  }
}
