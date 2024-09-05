import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Permission } from './permission.schema';

export type RoleDocument = HydratedDocument<Role>;

@Schema()
export class Role {

  @Prop()
  name: string;
  
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }] })
  permissions: Permission[];
 
}

export const RoleSchema = SchemaFactory.createForClass(Role);