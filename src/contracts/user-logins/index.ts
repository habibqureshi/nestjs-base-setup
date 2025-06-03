import { initContract } from '@ts-rest/core';
import { PaginationOptions } from 'src/common/types/common.types';
import { PaginatedResponseSchema } from 'src/common/types/user-login.types';

const c = initContract();

export const userLoginContract = c.router(
  {
    getUserLogins: {
      path: '',
      summary: 'Get users',
      method: 'GET',
      query: PaginationOptions,
      responses: {
        200: PaginatedResponseSchema,
      },
    },
  },
  { pathPrefix: '/user-login' },
);
