import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { AuthService } from '../auth.service';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'basic') {
  constructor(private moduleRef: ModuleRef) {
    super({ realm: 'App' });
  }

  async validate(username: string, password: string): Promise<any> {
    const authService = await this.moduleRef.resolve(AuthService);
    await authService.validateClient(username, password);
    return { email: '-' };
  }
}
