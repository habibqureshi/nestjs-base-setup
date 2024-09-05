import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Role } from './role.schema';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {

  @Prop()
  name: string;

  @Prop()
  password: string;

  @Prop({unique:true,required:true})
  email: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }] })
  roles: Role[];

  enable:boolean;

  deleted:boolean;
 
}

export const UserSchema = SchemaFactory.createForClass(User);