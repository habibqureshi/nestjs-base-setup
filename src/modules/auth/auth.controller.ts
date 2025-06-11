import { Controller, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtRefreshTokenGuard } from './guards/refresh-token.guard';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { api } from 'src/contracts';
import { UserReq } from 'src/common/decorators/user.decorator';
import { IUser } from 'src/interfaces/user.interface';
import { ServerInferRequest } from '@ts-rest/core';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Protected } from 'src/config/decorator/protected.decorator';
import { Public } from 'src/config/decorator/public.route.decorator';

type LoginReq = ServerInferRequest<typeof api.auth.login>;
type RefreshReq = ServerInferRequest<typeof api.auth.refresh>;
@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Protected()
  @UseGuards(LocalAuthGuard)
  @TsRestHandler(api.auth.login)
  async login(@UserReq() user: IUser) {
    return tsRestHandler(api.auth.login, async (_: LoginReq) => {
      const response = await this.authService.login(user);
      return { status: HttpStatus.OK, body: response };
    });
  }

  @Public()
  @UseGuards(JwtRefreshTokenGuard)
  @TsRestHandler(api.auth.refresh)
  async refresh(@UserReq() user: IUser) {
    return tsRestHandler(
      api.auth.refresh,
      async ({ headers, body }: RefreshReq) => {
        const response = await this.authService.refresh(user, {
          accessToken: body.accessToken,
          refreshToken: headers.authorization,
        });
        return { status: HttpStatus.OK, body: response };
      },
    );
  }

  @TsRestHandler(api.auth.logout)
  async logout() {
    return tsRestHandler(api.auth.logout, async ({ headers }) => {
      await this.authService.logout(headers.authorization);
      return {
        status: HttpStatus.OK,
        body: { message: 'Logged out successfully!' },
      };
    });
  }
}
