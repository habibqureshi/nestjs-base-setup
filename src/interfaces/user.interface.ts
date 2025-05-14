import { Document, Types } from 'mongoose';
import { Role } from 'src/modules/roles/entities/role.entity';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  roles: Array<Role>;
  deleted: boolean;
  enable: boolean;
  password: string;
}
