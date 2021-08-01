import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Room, RoomDocument } from './schemas/room.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { getObjectId } from 'src/utils/db';
import { Role } from './entities/room.entity';

@Injectable()
export class RoomsService {
  constructor(@InjectModel(Room.name) private roomModel: Model<RoomDocument>) {}

  async create(payload: CreateRoomDto) {
    payload.members = payload.members.map((member) => ({
      ...member,
      role: member.role > Role.USER ? Role.USER : member.role,
    }));
    const newRoom = await this.roomModel.create(payload);
    return newRoom;
  }

  async findAll(limit = 50, skip = 0) {
    const rooms = await this.roomModel.find().skip(skip).limit(limit);
    return rooms;
  }

  async findOne(id: string) {
    const roomId = getObjectId(id);
    const room = await this.roomModel.findById(roomId);
    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {
    const roomId = getObjectId(id);

    const room = await this.roomModel.updateOne({ _id: roomId }, updateRoomDto);

    return room;
  }

  async remove(id: string) {
    const roomId = getObjectId(id);

    await this.roomModel.deleteOne({ _id: roomId });

    return `The #${id} room is removed`;
  }
}
