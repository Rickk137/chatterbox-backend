import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
}

export const UserSchema = SchemaFactory.createForClass(User);
