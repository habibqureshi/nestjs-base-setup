import { extendZodWithOpenApi } from '@anatine/zod-openapi';
import { z } from 'zod';
import { IBaseEntity, PaginationMeta } from './common.types';

extendZodWithOpenApi(z);

export const UserLoginSchema = IBaseEntity.extend({
  ipAddress: z.string(),
  userAgent: z.string(),
  provider: z.string(),
});

export type UserLoginSchema = z.infer<typeof UserLoginSchema>;

export const PaginatedResponseSchema = z.object({
  items: z.array(UserLoginSchema),
  meta: PaginationMeta,
});

export type PaginatedResponseSchema = z.infer<typeof PaginatedResponseSchema>;
