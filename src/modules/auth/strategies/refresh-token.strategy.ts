import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { APP_CONFIGS } from 'src/config/app.config';
import { IJwtPayload } from 'src/interfaces/jwt.payload';
import { ModuleRef } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { IUser } from 'src/interfaces/user.interface';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private moduleRef: ModuleRef) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: APP_CONFIGS.JWT.REFRESH_SECRET,
    });
  }
  async validate(payload: IJwtPayload): Promise<IUser> {
    const authService = await this.moduleRef.resolve(AuthService);
    const user = await authService.findUserById(payload.sub);
    return { ...user };
  }
}
