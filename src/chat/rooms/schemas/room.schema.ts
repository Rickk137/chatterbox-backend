import { Member, Role } from '../entities/room.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RoomDocument = Room & Document;

@Schema()
class MemberDoc extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
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

  @Prop({ type: [{ type: Types.ObjectId, ref: Room.name, default: [] }] })
  @Prop({
    type: [MemberSchema],
    default: [],
  })
  members: Member[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
