import { z } from 'zod';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';
import { IBaseEntity, PaginationMeta, PaginationOptions } from './common.types';

extendZodWithOpenApi(z);

export const RoleZod = IBaseEntity.extend({
  name: z.string().openapi({ example: 'admin' }),
  permissions: z
    .array(
      z.object({
        id: z.number().openapi({ example: 1 }),
        name: z.string().openapi({ example: 'create:user' }),
      }),
    )
    .optional(),
});

export const CreateRoleZod = RoleZod.pick({
  name: true,
})
  .extend({
    permissions: z
      .array(z.number())
      .optional()
      .openapi({
        example: [1, 2],
      }),
  })
  .openapi({
    example: {
      name: 'admin',
      permissions: [1, 2],
    },
  });

export const UpdateRoleZod = CreateRoleZod.partial();

export const PaginatedRolesSchema = z.object({
  items: z.array(RoleZod),
  meta: PaginationMeta,
});

export const RolesPaginationOpions = PaginationOptions.extend({
  name: z.string().optional(),
});

export type RolesPaginationOpions = z.infer<typeof RolesPaginationOpions>;
export type RoleZod = z.infer<typeof RoleZod>;
export type CreateRoleZod = z.infer<typeof CreateRoleZod>;
export type UpdateRoleZod = z.infer<typeof UpdateRoleZod>;
export type PaginatedRolesSchema = z.infer<typeof PaginatedRolesSchema>;
