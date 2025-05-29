import { initContract } from '@ts-rest/core';
import { userContract } from './users';
import { authContract } from './auth';
import { roleContract } from './role';
import { permissionContract } from './permission';

const c = initContract();

export const api = c.router(
  {
    user: userContract,
    auth: authContract,
    role: roleContract,
    permission: permissionContract,
  },
  { pathPrefix: '/api' },
);
