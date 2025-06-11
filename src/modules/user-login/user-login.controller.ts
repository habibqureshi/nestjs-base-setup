import { Controller } from '@nestjs/common';
import { UserLoginService } from './user-login.service';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { api } from 'src/contracts';
import { ServerInferRequest } from '@ts-rest/core';
import { UserReq } from 'src/common/decorators/user.decorator';
import { IUser } from 'src/interfaces/user.interface';

type GetUserLogins = ServerInferRequest<typeof api.userLogin.getUserLogins>;

@Controller()
export class UserLoginController {
  constructor(private readonly service: UserLoginService) {}

  @TsRestHandler(api.userLogin.getUserLogins)
  async getUserLogins(@UserReq() user: IUser) {
    return tsRestHandler(
      api.userLogin.getUserLogins,
      async ({ query }: GetUserLogins) => {
        const data = await this.service.findManyWithPagination(
          {
            where: {
              user: { id: user.id },
            },
          },
          query,
        );
        return { status: 200, body: data };
      },
    );
  }
}
