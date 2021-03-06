import { MessageType, ContentType } from '../entities/message.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true })
  content: string;

  @Prop({ default: ContentType.TEXT })
  contentType: string;

  @Prop()
  timestamp: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ required: true })
  receiver: Types.ObjectId;

  @Prop({ default: MessageType.USER })
  type: number;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
