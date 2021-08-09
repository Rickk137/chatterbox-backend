import { UsersService } from './../users/users.service';
import { AuthService } from './../auth/auth.service';
import { Logger } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateMessageDto } from './messages/dto/create-message.dto';
import { MessageType } from './messages/entities/message.entity';

let users = [];

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @WebSocketServer() server: Server;

  private logger: Logger = new Logger('AppGateway');

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    const user = await this.authService.verifyToken(
      client.handshake.auth.token,
    );
    if (!user || !user.sub) {
      client.disconnect();
    }
    const userId = user.sub;
    client.join(userId);

    const userInfo = await this.usersService.findOne(userId);
    client.join(userInfo.rooms.map((roomId) => `${roomId}`));
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    users = users.filter((user) => user !== client.id);
    this.server.emit('message', users);
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: CreateMessageDto): void {
    if (message.type === MessageType.ROOM) {
      this.server.to(message.receiver).emit('message', message);
    }
  }

  @SubscribeMessage('join-room')
  joinChannel(client: Socket, @MessageBody() message: string): void {}
}
