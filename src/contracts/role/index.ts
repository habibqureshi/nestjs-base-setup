import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  CreateRoleZod,
  PaginatedRolesSchema,
  RolesPaginationOpions,
  RoleZod,
  UpdateRoleZod,
} from '../../common/types/role.types';
import {
  BadRequestError,
  NotFoundError,
  SuccessMessage,
} from 'src/common/types/error-responses.types';

const c = initContract();

export const roleContract = c.router(
  {
    getRoles: {
      method: 'GET',
      path: '',
      query: RolesPaginationOpions,
      responses: {
        200: PaginatedRolesSchema,
      },
      summary: 'Get all roles',
      description: 'Retrieve a list of all roles with their permissions',
    },
    getRole: {
      method: 'GET',
      path: '/:id',
      pathParams: z.object({
        id: z.coerce.number().int(),
      }),
      responses: {
        200: RoleZod,
        404: NotFoundError,
      },
      summary: 'Get role by ID',
      description: 'Retrieve a specific role by its ID',
    },
    createRole: {
      method: 'POST',
      path: '',
      body: CreateRoleZod,
      responses: {
        200: RoleZod,
        400: BadRequestError,
      },
      summary: 'Create new role',
      description: 'Create a new role with specified permissions',
    },
    updateRole: {
      method: 'PUT',
      path: '/:id',
      pathParams: z.object({ id: z.coerce.number().int() }),
      body: UpdateRoleZod,
      responses: {
        200: RoleZod,
        404: NotFoundError,
      },
      summary: 'Update role',
      description: 'Update an existing role and its permissions',
    },
    deleteRole: {
      method: 'DELETE',
      path: '/:id',
      pathParams: z.object({ id: z.coerce.number().int() }),
      responses: {
        200: SuccessMessage,
        404: NotFoundError,
      },
      summary: 'Delete role',
      description: 'Soft delete a role by its ID',
    },
  },
  {
    pathPrefix: '/role',
  },
);
