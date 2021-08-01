import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppService } from './app.service';
import { AppController } from './app.controller';

import { ChatModule } from './chat/chat.module';
import { UsersModule } from './users/users.module';
import { MediaController } from './media/media.controller';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/chatterbox'),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/media',
    }),
    ChatModule,
    UsersModule,
  ],
  controllers: [AppController, MediaController],
  providers: [AppService],
})
export class AppModule {}
