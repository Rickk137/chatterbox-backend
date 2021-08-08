import { RoomsService } from './../rooms/rooms.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Message, MessageDocument } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { getObjectId } from 'src/utils/db';
import { UsersService } from 'src/users/users.service';
import { MessageType } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private readonly userService: UsersService,
    private readonly roomService: RoomsService,
  ) {}

  async create(createMessageDto: CreateMessageDto, userId) {
    const { content, receiver, type } = createMessageDto;

    if (
      !content ||
      !receiver ||
      type === undefined ||
      type > MessageType.ROOM
    ) {
      throw new BadRequestException();
    }

    if (type === MessageType.USER) {
      await this.userService.addPrivateRoom(userId, receiver);
    } else if (type === MessageType.ROOM) {
      const room = await this.roomService.findOne(receiver);

      if (!room) {
        throw new BadRequestException('Room not found');
      }

      if (
        room.members.findIndex(
          (member) => member.userId !== getObjectId(userId),
        ) < 0
      ) {
        throw new ForbiddenException('Only chat members can send messages');
      }
    }

    const payload = {
      content,
      receiver,
      type,
      timestamp: new Date(),
      author: userId,
    };
    const message = await this.messageModel.create(payload);

    return message;
  }

  async findAll(limit = 50, skip = 0) {
    const messages = await this.messageModel.find().skip(skip).limit(limit);

    return messages;
  }

  async findOne(id: string) {
    const messageId = getObjectId(id);
    const message = await this.messageModel
      .findById(messageId)
      .populate('members.userId', 'name family username');

    return message;
  }

  async update(id: string, updateMessageDto: UpdateMessageDto) {
    const messageId = getObjectId(id);

    const message = await this.messageModel.updateOne(
      { _id: messageId },
      updateMessageDto,
    );

    return message;
  }

  async remove(id: string, userId: string) {
    const messageId = getObjectId(id);
    const message = await this.messageModel.findById(messageId);

    if (message.author !== getObjectId(userId)) {
      throw new ForbiddenException('Only message author can delete it');
    }

    await this.messageModel.deleteOne({ _id: messageId });

    return `The #${id} message is removed`;
  }
}
