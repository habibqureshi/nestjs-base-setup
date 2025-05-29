import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { PaginationOptions } from 'src/common/types/common.types';
import {
  CreatePermissionZod,
  PaginatedPermissionsSchema,
  PermissionZod,
  UpdatePermissionZod,
} from '../../common/types/permission.types';
import {
  BadRequestError,
  NotFoundError,
  SuccessMessage,
} from 'src/common/types/error-responses.types';

const c = initContract();

export const permissionContract = c.router(
  {
    getPermissions: {
      path: '',
      method: 'GET',
      query: PaginationOptions,
      responses: {
        200: PaginatedPermissionsSchema,
      },
      summary: 'Get all permissions',
      description: 'Retrieve a paginated list of all permissions',
    },
    getPermission: {
      method: 'GET',
      path: '/:id',
      pathParams: z.object({
        id: z.coerce.number().int(),
      }),
      responses: {
        200: PermissionZod,
        404: NotFoundError,
      },
      summary: 'Get permission by ID',
      description: 'Retrieve a specific permission by its ID',
    },
    createPermission: {
      method: 'POST',
      path: '',
      body: CreatePermissionZod,
      responses: {
        200: PermissionZod,
        400: BadRequestError,
      },
      summary: 'Create new permission',
      description: 'Create a new permission',
    },
    updatePermission: {
      method: 'PUT',
      path: '/:id',
      pathParams: z.object({ id: z.coerce.number().int() }),
      body: UpdatePermissionZod,
      responses: {
        200: PermissionZod,
        404: NotFoundError,
      },
      summary: 'Update permission',
      description: 'Update an existing permission',
    },
    deletePermission: {
      method: 'DELETE',
      path: '/:id',
      pathParams: z.object({ id: z.coerce.number().int() }),
      responses: {
        200: SuccessMessage,
        404: NotFoundError,
      },
      summary: 'Delete permission',
      description: 'Soft delete a permission by its ID',
    },
  },
  { pathPrefix: '/permission' },
);
