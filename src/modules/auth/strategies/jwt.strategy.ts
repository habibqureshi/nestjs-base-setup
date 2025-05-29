import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { APP_CONFIGS } from 'src/config/app.config';
import { AuthService } from '../auth.service';
import { ModuleRef } from '@nestjs/core';
import { IJwtPayload } from 'src/interfaces/jwt.payload';
import { IUser } from 'src/interfaces/user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private moduleRef: ModuleRef) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: APP_CONFIGS.JWT.SECRET,
    });
  }

  async validate(payload: IJwtPayload): Promise<IUser> {
    const authService = await this.moduleRef.resolve(AuthService);
    const user = await authService.findUserById(payload.sub);
    return {
      ...user,
    };
  }
}
