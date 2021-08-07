import { PagerMiddleware } from './../../middlewares/pager.middleware';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from './schemas/room.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }]),
    UsersModule,
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PagerMiddleware)
      .forRoutes({ path: 'rooms', method: RequestMethod.GET });
  }
}
