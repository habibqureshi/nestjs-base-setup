import { extendZodWithOpenApi } from '@anatine/zod-openapi';
import { z } from 'zod';
import { UserZod } from './user.types';

extendZodWithOpenApi(z);

export const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Required'),
});
export type LoginSchema = z.infer<typeof LoginSchema>;

export const TokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserZod.pick({ id: true, name: true, email: true }),
});
export type TokenResponseSchema = z.infer<typeof TokenResponseSchema>;

export const RefreshSchema = z.object({
  Authorization: z.string().min(1, 'Required'),
});

export type RefreshSchema = z.infer<typeof RefreshSchema>;
