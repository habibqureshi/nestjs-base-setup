import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { IUser } from 'src/interfaces/user.interface';

export const UserReq = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IUser => {
    const request: Request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
