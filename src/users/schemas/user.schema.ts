import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop()
  family: string;

  @Prop({
    type: String,
    unique: true,
    required: true,
    trim: true,
    dropDups: true,
    nullable: false,
  })
  username: string;

  @Prop({
    type: String,
    unique: true,
    required: true,
    trim: true,
    dropDups: true,
    nullable: false,
  })
  email: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Room', default: [] }] })
  rooms: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
