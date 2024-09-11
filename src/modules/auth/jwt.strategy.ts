import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from '../logger/logger.service';
import { jwtConstants } from 'src/constants/jwt.constant';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }
  async validate(payload: any) {
    // console.log(`token validated ${JSON.stringify(payload)}`)
    let currentUser:any = {
        email:payload.email,
        userId:payload.id
    }
    return currentUser;
  }
}