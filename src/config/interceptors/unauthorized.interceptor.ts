import { HttpException, HttpStatus } from '@nestjs/common';

export class UnauthorizedErrorInterceptor extends HttpException {
  constructor(errors: string[]) {
    super(
      {
        status: HttpStatus.UNAUTHORIZED,
        message: HttpStatus[HttpStatus.UNAUTHORIZED],
        errors,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
