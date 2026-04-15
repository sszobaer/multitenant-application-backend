
import { Tenant } from 'src/tenants/schema/tanent.schema';
import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type InvitationDocument = HydratedDocument<Invitation>;
@Schema({ timestamps: true })
export class Invitation {

  @Prop({ required: true })
  email!: string;

  @Prop({ unique: true, required: true })
  token!: string;

  @Prop({ default: 'pending' })
  status!: 'pending' | 'accepted' | 'expired';

  @Prop({ type: mongoose.Schema.ObjectId, ref: 'Tenant' })
  tenant!: mongoose.Types.ObjectId;

  @Prop({ required: true })
  expiresAt!: Date;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);