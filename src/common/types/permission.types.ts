import { z } from 'zod';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';
import { IBaseEntity, PaginationMeta } from './common.types';

extendZodWithOpenApi(z);

export const PermissionZod = IBaseEntity.extend({
  name: z.string().openapi({ example: 'create:user' }),
  url: z.string(),
  regex: z.string(),
});

export const CreatePermissionZod = PermissionZod.pick({
  name: true,
  url: true,
  regex: true,
});

export const UpdatePermissionZod = CreatePermissionZod.partial().openapi({
  example: {
    name: 'create:admin',
    description: 'Permission to create new admin users',
  },
});

export const PermissionResponseZod = z.object({
  data: PermissionZod,
  message: z.string(),
});

export const PaginatedPermissionsSchema = z.object({
  items: z.array(PermissionZod),
  meta: PaginationMeta,
});

export type PermissionZod = z.infer<typeof PermissionZod>;
export type CreatePermissionZod = z.infer<typeof CreatePermissionZod>;
export type UpdatePermissionZod = z.infer<typeof UpdatePermissionZod>;
export type PermissionResponseZod = z.infer<typeof PermissionResponseZod>;
export type PaginatedPermissionsSchema = z.infer<
  typeof PaginatedPermissionsSchema
>;
