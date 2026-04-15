import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

//Accessing Mongo-specific fields (_id, methods)
export type UserDocument = HydratedDocument<User>;
@Schema({timestamps: true})
export class User {
  @Prop()
  name!: string;

  @Prop({ unique: true, required: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ default: 'user' })
  role!: string;

  @Prop({type: mongoose.Schema.ObjectId, ref: 'Tenant'})
  tenant!: mongoose.Types.ObjectId;
}

//The actual Collection in MongoDb
export const UserSchema = SchemaFactory.createForClass(User);

//In MongoDB + Mongoose, the class is just a blueprint, and you also need a compiled schema + typing