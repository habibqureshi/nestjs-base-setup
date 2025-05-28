import { Permission } from 'src/modules/permissions/entities/permission.entity';

export interface IUser {
  id: number;
  name: string;
  email: string;
  permissions: Record<
    string,
    { roleId: number; roleName: string; permission: Permission }
  >;
}
