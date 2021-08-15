import {
  ForbiddenException,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Room, RoomDocument } from './schemas/room.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { getObjectId } from 'src/utils/db';
import { Role } from './entities/room.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    private readonly userService: UsersService,
  ) {}

  async create(createRoomDto: CreateRoomDto, userId) {
    const { name, icon } = createRoomDto;

    const payload = {
      name,
      icon,
      members: [
        {
          userId,
          role: Role.OWNER,
        },
      ],
    };

    // payload.members = payload.members.map((member) => ({
    //   ...member,
    //   role: member.role > Role.USER ? Role.USER : member.role,
    // }));

    const newRoom = await this.roomModel.create(payload);
    await this.userService.joinRoom(userId, newRoom._id);

    return newRoom;
  }

  async addUserToRoom(id: string, userId: string, memberId: string) {
    const roomId = getObjectId(id);
    const room = await this.roomModel.findById(roomId);

    if (!room) {
      throw new NotFoundException();
    }

    const members = room.members;
    const member = members.find((item) => `${item.userId}` === userId);

    if (!member || member.role > Role.ADMIN) {
      throw new ForbiddenException();
    }

    if (members.find((item) => item.userId === getObjectId(memberId))) {
      throw new BadRequestException('User Already in the Room');
    }

    members.push({
      userId: getObjectId(memberId),
      role: Role.USER,
    });

    await this.userService.joinRoom(memberId, id);
    await this.update(id, { members });

    return 'Updated';
  }

  async findAll(limit = 50, skip = 0) {
    const rooms = await this.roomModel.find().skip(skip).limit(limit);

    return rooms;
  }

  async findOne(id: string) {
    const roomId = getObjectId(id);
    const room = await this.roomModel
      .findById(roomId)
      .populate('members.userId', 'name family username');

    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {
    const roomId = getObjectId(id);

    const room = await this.roomModel.updateOne({ _id: roomId }, updateRoomDto);

    return room;
  }

  async remove(id: string, userId: string) {
    const roomId = getObjectId(id);
    const room = await this.findOne(id);

    const userIdObject = getObjectId(userId);
    const member = room.members.find(
      (member) => member.userId === userIdObject,
    );

    if (!member || member.role !== Role.OWNER) throw new ForbiddenException();

    await this.userService.leaveRoom(userId, id);
    await this.roomModel.deleteOne({ _id: roomId });

    return `The #${id} room is removed`;
  }

  async getUserRooms(userId: string, limit = 50, skip = 0) {
    const rooms = this.userService.getUserRooms(userId);
    return rooms;
  }
}
