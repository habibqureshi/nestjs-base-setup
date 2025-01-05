import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { APP_CONFIGS } from 'src/config/app.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    console.log('auth stratergy init');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: APP_CONFIGS.JWT.SECRET,
    });
  }
  async validate(payload: any) {
    console.log(`token validated ${JSON.stringify(payload)}`);
    const currentUser: any = {
      email: payload.email,
      userId: payload.id,
    };
    return currentUser;
  }
}
