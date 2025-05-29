import {
  BadRequestException,
  HttpStatus,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
} from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';

type ErrorWithResponse = {
  status?: number;
  response?: {
    errors?: string[];
    message?: string;
  };
};

@Injectable()
export class BadRequestInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error: ErrorWithResponse) => {
        if (error?.status === 400) {
          const errorResponse = {
            status: HttpStatus.BAD_REQUEST,
            message: HttpStatus[HttpStatus.BAD_REQUEST],
            errors: error?.response?.errors || [error?.response?.message],
          };
          return throwError(() => new BadRequestException(errorResponse));
        }
        return throwError(() => error);
      }),
    );
  }
}
