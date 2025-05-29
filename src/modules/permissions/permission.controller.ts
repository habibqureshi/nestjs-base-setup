import { Controller } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { api } from 'src/contracts';

@Controller()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @TsRestHandler(api.permission.getPermissions)
  async getPermissions() {
    return tsRestHandler(api.permission.getPermissions, async ({ query }) => {
      const result = await this.permissionService.findManyWithPagination(
        {},
        query,
      );
      return {
        status: 200,
        body: result,
      };
    });
  }

  @TsRestHandler(api.permission.getPermission)
  async getPermission() {
    return tsRestHandler(api.permission.getPermission, async ({ params }) => {
      const result = await this.permissionService.findById(params.id);
      return {
        status: 200,
        body: result,
      };
    });
  }

  @TsRestHandler(api.permission.createPermission)
  async createPermission() {
    return tsRestHandler(api.permission.createPermission, async ({ body }) => {
      const result = await this.permissionService.create(body);
      return {
        status: 200,
        body: result,
      };
    });
  }

  @TsRestHandler(api.permission.updatePermission)
  async updatePermission() {
    return tsRestHandler(
      api.permission.updatePermission,
      async ({ params, body }) => {
        const result = await this.permissionService.update(params.id, body);
        return {
          status: 200,
          body: result,
        };
      },
    );
  }

  @TsRestHandler(api.permission.deletePermission)
  async deletePermission() {
    return tsRestHandler(
      api.permission.deletePermission,
      async ({ params }) => {
        await this.permissionService.delete(params.id.toString());
        return {
          status: 200,
          body: {
            message: 'Permission deleted successfully',
          },
        };
      },
    );
  }
}
