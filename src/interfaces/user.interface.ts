import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  roles: Array<string>;
  deleted: boolean;
  enable: boolean;
  password: string;
}
