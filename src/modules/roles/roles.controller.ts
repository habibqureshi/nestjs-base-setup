import { Controller, NotFoundException } from '@nestjs/common';
import { RoleService } from './roles.service';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { api } from 'src/contracts';
import { ServerInferRequest } from '@ts-rest/core';
import { FindManyOptions } from 'typeorm';

type CreateRole = ServerInferRequest<typeof api.role.createRole>;
type GetRoles = ServerInferRequest<typeof api.role.getRoles>;
type GetRole = ServerInferRequest<typeof api.role.getRole>;
type UpdateRole = ServerInferRequest<typeof api.role.updateRole>;

@Controller()
export class RolesController {
  constructor(private readonly service: RoleService) {}

  @TsRestHandler(api.role.createRole)
  async createRole() {
    return tsRestHandler(api.role.createRole, async ({ body }: CreateRole) => {
      const role = await this.service.create(body);
      return { status: 200, body: role };
    });
  }

  @TsRestHandler(api.role.getRoles)
  async getRoles() {
    return tsRestHandler(api.role.getRoles, async ({ query }: GetRoles) => {
      const where: FindManyOptions['where'] = {};
      if (query.name) {
        where.name = `%${query.name}%`;
      }
      const data = await this.service.findManyWithPagination(
        { where },
        { ...query },
      );
      return { status: 200, body: data };
    });
  }

  @TsRestHandler(api.role.getRole)
  async getRoleDetail() {
    return tsRestHandler(api.role.getRole, async ({ params }: GetRole) => {
      const data = await this.service.findOneOrNull({
        where: { id: params.id },
        relations: ['permissions'],
        select: { permissions: { id: true, name: true } },
      });
      if (!data) {
        throw new NotFoundException('Role not found!');
      }
      return { status: 200, body: data };
    });
  }

  @TsRestHandler(api.role.updateRole)
  async updateRole() {
    return tsRestHandler(
      api.role.updateRole,
      async ({ params, body }: UpdateRole) => {
        const data = await this.service.update(params.id, body);
        return { status: 200, body: data };
      },
    );
  }

  @TsRestHandler(api.role.deleteRole)
  async deleteRole() {
    return tsRestHandler(api.role.deleteRole, async ({ params }) => {
      await this.service.delete(params.id);
      return {
        status: 200,
        body: { message: 'Role deleted successfully!' },
      };
    });
  }
}
