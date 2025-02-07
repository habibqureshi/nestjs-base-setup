import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { Public } from 'src/config/decorator/public.route.decorator';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtRefreshTokenGuard } from './refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Public()
  @UseGuards(JwtRefreshTokenGuard)
  @Post('/refresh')
  async refresh(@Request() req) {
    return await this.authService.refresh(req.user);
  }
}
