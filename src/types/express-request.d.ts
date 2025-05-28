import { IUser } from '../interfaces/user.interface';
import 'express';

declare module 'express' {
  export interface Request {
    user?: IUser;
    requestId?: string;
  }
}

export {};
