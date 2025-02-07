import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { APP_CONFIGS } from 'src/config/app.config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: APP_CONFIGS.JWT.REFRESH_SECRET,
      signOptions: { expiresIn: APP_CONFIGS.JWT.REFRESH_EXPIRY },
      passReqToCallback: true,
    });
  }
  async validate(req: Request, payload: any) {
    const refreshToken = req.headers.authorization.replace('Bearer', '').trim();
    return { ...payload, refreshToken };
  }
}
