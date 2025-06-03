import { extendZodWithOpenApi } from '@anatine/zod-openapi';
import { z } from 'zod';
import { UserZod } from './user.types';

extendZodWithOpenApi(z);

export const LoginSchema = z.object({
  email: z
    .string()
    .email('Invalid email')
    .openapi({ example: 'admin@example.com' }),
  password: z.string().min(1, 'Required').openapi({ example: '12345' }),
});
export type LoginSchema = z.infer<typeof LoginSchema>;

export const TokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserZod.pick({ id: true, name: true, email: true }),
});
export type TokenResponseSchema = z.infer<typeof TokenResponseSchema>;

export const RefreshSchema = z.object({
  authorization: z.string().min(1, 'Required'),
});

export const RefreshTokenBody = z.object({
  accessToken: z.string().min(1, 'Required'),
});

export type RefreshTokenBody = z.infer<typeof RefreshTokenBody>;

export type RefreshSchema = z.infer<typeof RefreshSchema>;
