import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { RoomsModule } from './rooms/rooms.module';
import { MessagesModule } from './messages/message.module';

@Module({
  imports: [RoomsModule, MessagesModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
