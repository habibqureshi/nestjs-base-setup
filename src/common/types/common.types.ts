import { z } from 'zod';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';

extendZodWithOpenApi(z);
export const dateOrString = z.union([z.string().datetime(), z.date()]);

export const IBaseEntity = z.object({
  id: z.number().openapi({ example: 'dbid' }),
  __entity: z.string().optional().openapi({ example: 'Entity' }),
  createdAt: dateOrString.openapi({ example: new Date() }),
  updatedAt: dateOrString.openapi({ example: new Date() }),
  deletedAt: dateOrString.nullable().openapi({ example: new Date() }),
  deleted: z.boolean().openapi({ example: false }),
  enable: z.boolean().openapi({ example: true }),
});

export type IBaseEntity = z.infer<typeof IBaseEntity>;

export const PaginationOptions = z.object({
  limit: z.coerce.number().optional().default(10),
  page: z.coerce.number().optional().default(1),
});

export type PaginationOptions = z.infer<typeof PaginationOptions>;

export const PaginationMeta = z.object({
  totalItems: z.number(),
  itemCount: z.number(),
  itemsPerPage: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
});

export type PaginationMeta = z.infer<typeof PaginationMeta>;
