import { initContract } from '@ts-rest/core';
import {
  LoginSchema,
  RefreshSchema,
  RefreshTokenBody,
  TokenResponseSchema,
} from 'src/common/types/auth.types';
import {
  BadRequestError,
  SuccessMessage,
  UnauthorizedError,
  UnprocessableError,
} from 'src/common/types/error-responses.types';

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
        401: UnauthorizedError,
      },
    },
    refresh: {
      path: '/refresh',
      method: 'POST',
      summary: 'Refresh token',
      headers: RefreshSchema,
      body: RefreshTokenBody,
      responses: {
        200: TokenResponseSchema,
        400: BadRequestError,
      },
    },
    logout: {
      path: '/logout',
      method: 'DELETE',
      summary: 'Logout',
      responses: {
        200: SuccessMessage,
        401: UnauthorizedError,
        400: BadRequestError,
      },
    },
  },
  { pathPrefix: '/auth' },
);
