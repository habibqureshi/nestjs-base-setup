import { initContract } from '@ts-rest/core';
import { PaginationOptions } from 'src/common/types/common.types';
import { BadRequestError } from 'src/common/types/error-responses.types';
import {
  CreateUser,
  PaginatedResponseSchema,
  UserZod,
} from 'src/common/types/user.types';

const c = initContract();

export const userContract = c.router(
  {
    getUser: {
      path: '',
      summary: 'Get users',
      method: 'GET',
      query: PaginationOptions,
      responses: {
        200: PaginatedResponseSchema,
      },
    },
    createUser: {
      path: '',
      summary: 'Create User',
      method: 'POST',
      body: CreateUser,
      responses: {
        200: UserZod,
        400: BadRequestError,
      },
    },
  },
  { pathPrefix: '/user' },
);
