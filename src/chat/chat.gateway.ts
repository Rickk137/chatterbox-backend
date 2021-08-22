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
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateMessageDto } from './messages/dto/create-message.dto';
import { MessageType } from './messages/entities/message.entity';
import { MessagesService } from './messages/message.service';

let users = [];

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly messagesService: MessagesService,
  ) {}

  @WebSocketServer() server: Server;

  private logger: Logger = new Logger('AppGateway');

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  async checkSocket(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    const user = await this.authService.verifyToken(
      client.handshake.auth.token,
    );
    if (!user || !user.sub) {
      client.disconnect();
    }
    const userId = user.sub;
    client.join(userId);

    return userId;
  }

  async handleConnection(client: Socket) {
    this.joinRooms(client);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    users = users.filter((user) => user !== client.id);
    this.server.emit('message', users);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() message: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = await this.checkSocket(client);
    const msg = { ...message, timestamp: new Date().getTime(), author: userId };

    if (message.type === MessageType.ROOM) {
      this.server.to(message.receiver).emit('message', msg);
    } else if (message.type === MessageType.USER) {
      this.server.to(message.receiver).emit('message', msg);
      client.emit('message', msg);
    }

    this.messagesService.create(msg, userId);
  }

  @SubscribeMessage('join-room')
  async joinRooms(@ConnectedSocket() client: Socket) {
    const userId = await this.checkSocket(client);

    const userInfo = await this.usersService.findOne(userId);
    client.join(userInfo.rooms.map((roomId) => `${roomId}`));
  }

  @SubscribeMessage('update-rooms')
  async updateRooms(
    @ConnectedSocket() client: Socket,
    @MessageBody() user: string,
  ) {
    await this.checkSocket(client);
    const userInfo = await this.usersService.findOne(user);

    if (!userInfo) return;

    this.server.to(user).emit('update-rooms');
  }

  @SubscribeMessage('call')
  async callUser(
    @MessageBody() user: string,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = await this.checkSocket(client);

    this.server.to(user).emit('calling', userId);
  }
}
