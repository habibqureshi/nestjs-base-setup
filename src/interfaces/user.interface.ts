import { Document, Types } from 'mongoose';
import { IRole } from './role.interface';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  roles: Array<string>;
  deleted: boolean;
  enable: boolean;
  password: string;
}
