/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

import {
  HttpStatus,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class NotFoundErrorInterceptor implements NestInterceptor {
  intercept(
    _: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      catchError((error) => {
        if (error?.status === 404) {
          const errorResponse = {
            status: HttpStatus.NOT_FOUND,
            message: HttpStatus[HttpStatus.NOT_FOUND],
            errors: [error.message],
          };
          return throwError(() => new NotFoundException(errorResponse));
        }
        return throwError(() => error);
      }),
    );
  }
}
