import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type TenantDocument = HydratedDocument<Tenant>;

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true })
  name!: string;

  @Prop({ default: false })
  isActive!: boolean;

  @Prop({ unique: true, sparse: true })
  inviteCode!: string;

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User'})
  user!: mongoose.Types.ObjectId;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);