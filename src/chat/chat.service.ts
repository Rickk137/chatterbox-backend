import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  getHello(): string {
    return 'Chat is here!!';
  }
}
