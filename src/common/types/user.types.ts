import { z } from 'zod';
import { IBaseEntity, PaginationMeta } from './common.types';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';

extendZodWithOpenApi(z);

export const UserZod = IBaseEntity.extend({
  name: z.string().min(1, 'Required').openapi({ example: 'John Doe' }),
  email: z
    .string()
    .email('Invalid email')
    .openapi({ example: 'johndoe@email.com' }),
  roles: z
    .array(
      z.object({
        name: z.string(),
      }),
    )
    .optional(),
});

export const PaginatedResponseSchema = z.object({
  items: z.array(UserZod.partial()),
  meta: PaginationMeta,
});

export const CreateUser = UserZod.pick({
  name: true,
  email: true,
}).extend({
  roles: z.array(z.number()).optional(),
  password: z.string().min(1, 'Required'),
});

export type CreateUser = z.infer<typeof CreateUser>;
export type UserZod = z.infer<typeof UserZod>;
export type PaginatedResponseSchema = z.infer<typeof PaginatedResponseSchema>;
