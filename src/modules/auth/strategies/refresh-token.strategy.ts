import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { APP_CONFIGS } from 'src/config/app.config';
import { IJwtPayload } from 'src/interfaces/jwt.payload';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: APP_CONFIGS.JWT.REFRESH_SECRET,
    });
  }
  async validate(payload: IJwtPayload): Promise<IJwtPayload> {
    return { ...payload };
  }
}
