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
      catchError((error: NotFoundException) => {
        const errorResponse = {
          status: HttpStatus.NOT_FOUND,
          message: HttpStatus[HttpStatus.NOT_FOUND],
          errors: [error.message],
        };
        return throwError(() => new NotFoundException(errorResponse));
      }),
    );
  }
}
