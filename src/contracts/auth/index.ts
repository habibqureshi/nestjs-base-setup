import { initContract } from '@ts-rest/core';
import {
  LoginSchema,
  RefreshSchema,
  TokenResponseSchema,
} from 'src/common/types/auth.types';
import {
  BadRequestError,
  UnprocessableError,
} from 'src/common/types/error-responses.types';
import { z } from 'zod';

const c = initContract();

export const authContract = c.router(
  {
    login: {
      path: '/login',
      method: 'POST',
      summary: 'Login',
      body: LoginSchema,
      metadata: {
        headers: true,
      },
      responses: {
        200: TokenResponseSchema,
        400: BadRequestError,
        422: UnprocessableError,
      },
    },
    refresh: {
      path: '/refresh',
      method: 'POST',
      summary: 'Refresh token',
      headers: RefreshSchema,
      body: z.any(),
      responses: {
        200: TokenResponseSchema,
        400: BadRequestError,
      },
    },
  },
  { pathPrefix: '/auth' },
);
