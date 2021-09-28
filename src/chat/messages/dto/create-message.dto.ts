import { MessageType } from '../entities/message.entity';

export class CreateMessageDto {
  content: string;
  receiver: string;
  type: MessageType;
  timestamp: number;
  contentType?: string;
}
