import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  HttpStatus,
  NestInterceptor,
} from '@nestjs/common';
import { RequestValidationError } from '@ts-rest/nest';
import { catchError, Observable, throwError } from 'rxjs';
import { ZodError } from 'zod';

export class ValidationErrorInterceptor implements NestInterceptor {
  private handleZodError(error: ZodError) {
    const errors = error.issues.map(
      (e) => `${e.path.map(String).join('.')} ${e.message}`,
    );

    return throwError(
      () =>
        new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          message: HttpStatus[HttpStatus.BAD_REQUEST],
          errors,
        }),
    );
  }

  intercept(
    _: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      catchError((error: RequestValidationError) => {
        if (error.pathParams?.name === 'ZodError')
          return this.handleZodError(error.pathParams);
        if (error.body?.name === 'ZodError')
          return this.handleZodError(error.body);
        if (error.query?.name === 'ZodError')
          return this.handleZodError(error.query);
        if (error.headers?.name === 'ZodError')
          return this.handleZodError(error.headers);
        return throwError(() => error);
      }),
    );
  }
}
