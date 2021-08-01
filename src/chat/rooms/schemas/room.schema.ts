import { Member, Role } from '../entities/room.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, SchemaTypes } from 'mongoose';

export type RoomDocument = Room & Document;

@Schema()
class MemberDoc extends Document {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'users', required: true })
  userId: Types.ObjectId;

  @Prop({ default: Role.USER })
  role: Role;
}

const MemberSchema = SchemaFactory.createForClass(MemberDoc);

@Schema()
export class Room {
  @Prop()
  name: string;

  @Prop()
  icon: string;

  @Prop({
    type: [MemberSchema],
    default: [],
  })
  members: Member[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
