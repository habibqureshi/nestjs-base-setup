import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { IJwtPayload } from 'src/interfaces/jwt.payload';
import { IUser } from 'src/interfaces/user.interface';

export const UserReq = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IUser | IJwtPayload => {
    const request: Request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
