import { Controller, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtRefreshTokenGuard } from './guards/refresh-token.guard';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { api } from 'src/contracts';
import { UserReq } from 'src/common/decorators/user.decorator';
import { IUser } from 'src/interfaces/user.interface';
import { ServerInferRequest } from '@ts-rest/core';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ClientAuthzGuard } from './guards/client-authz.guard';
import { Public } from 'src/config/decorator/public.route.decorator';

type LoginReq = ServerInferRequest<typeof api.auth.login>;

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(ClientAuthzGuard, LocalAuthGuard)
  @TsRestHandler(api.auth.login)
  async login(@UserReq() user: IUser) {
    return tsRestHandler(api.auth.login, async (_: LoginReq) => {
      const response = await this.authService.login(user);
      return { status: HttpStatus.OK, body: response };
    });
  }

  @UseGuards(JwtRefreshTokenGuard)
  @TsRestHandler(api.auth.refresh)
  async refresh(@UserReq() user: IUser) {
    return tsRestHandler(api.auth.refresh, async () => {
      const response = await this.authService.refresh(user);
      return { status: HttpStatus.OK, body: response };
    });
  }
}
