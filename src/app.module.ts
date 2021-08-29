import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { I18nModule, I18nJsonParser, HeaderResolver } from 'nestjs-i18n';

import { APP_FILTER } from '@nestjs/core';

import { AppService } from './app.service';
import { AppController } from './app.controller';

import { ChatModule } from './chat/chat.module';
import { UsersModule } from './users/users.module';
import { MediaController } from './media/media.controller';
import { AuthModule } from './auth/auth.module';
import { AllExceptionsFilter } from './http-exception.filter';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.DB_URL || 'mongodb://localhost:27017/chatterbox',
    ),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/media',
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'fa',
      parser: I18nJsonParser,
      parserOptions: {
        path: join(__dirname, '/i18n/'),
      },
      resolvers: [new HeaderResolver(['x-custom-lang'])],
    }),
    ChatModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController, MediaController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    AppService,
  ],
})
export class AppModule {}
