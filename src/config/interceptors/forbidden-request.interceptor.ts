import { HttpException, HttpStatus } from '@nestjs/common';

export class ForbiddenErrorInterceptor extends HttpException {
  constructor(errors: string[]) {
    super(
      {
        status: HttpStatus.FORBIDDEN,
        message: HttpStatus[HttpStatus.FORBIDDEN],
        errors,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
