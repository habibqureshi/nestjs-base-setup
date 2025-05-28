import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { api } from 'src/contracts';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { ServerInferRequest } from '@ts-rest/core';

type GetUser = ServerInferRequest<typeof api.user.getUser>;
type CreateUser = ServerInferRequest<typeof api.user.createUser>;

@Controller()
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @TsRestHandler(api.user.getUser)
  async getUser() {
    return tsRestHandler(api.user.getUser, async ({ query }: GetUser) => {
      const data = await this.userService.findManyWithPagination(
        {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        { limit: query.limit, page: query.page },
      );
      return {
        status: 200,
        body: data,
      };
    });
  }

  @TsRestHandler(api.user.getUser)
  async create() {
    return tsRestHandler(api.user.createUser, async ({ body }: CreateUser) => {
      const user = await this.userService.create(body);
      return { status: 200, body: user };
    });
  }
}
