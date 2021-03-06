import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { getObjectId } from 'src/utils/db';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(payload: CreateUserDto) {
    if (!payload.username)
      throw new BadRequestException('Username is required');
    if (!payload.email) throw new BadRequestException('Email is required');
    if (!payload.password)
      throw new BadRequestException('Password is required');

    let user = await this.findByUsername(payload.username);
    if (user) throw new BadRequestException({ key: 'auth.usernameExist' });

    user = await this.findByEmail(payload.email);
    if (user) throw new BadRequestException({ key: 'auth.emailExist' });

    const password = await bcrypt.hash(payload.password, 10);

    const newUser = await this.userModel.create({ ...payload, password });
    return newUser;
  }

  async findAll() {
    const users = await this.userModel.find();
    return users;
  }

  async search(query: string) {
    const queryOption = { $regex: query, $options: 'i' };
    const users = await this.userModel.find(
      {
        $or: [
          { name: queryOption },
          { family: queryOption },
          { email: queryOption },
          { username: queryOption },
        ],
      },
      'name family username _id',
    );
    return users;
  }

  async findOne(id: string) {
    const userId = getObjectId(id);
    const user = await this.userModel
      .findById(userId, 'name family privateRooms email username rooms')
      .populate('privateRooms', 'name family username');

    return user;
  }

  async findByUsername(username: string) {
    const user = await this.userModel.findOne({ username });
    return user;
  }

  async findById(_id: string) {
    const user = await this.userModel.findOne({ _id });
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userId = getObjectId(id);

    delete updateUserDto.password;

    if (!updateUserDto.username) delete updateUserDto.username;
    else {
      const existedUser = await this.userModel.findOne({
        username: updateUserDto.username,
        _id: { $ne: userId },
      });
      if (existedUser)
        throw new BadRequestException({ key: 'auth.usernameExist' });
    }

    if (!updateUserDto.email) delete updateUserDto.email;
    else {
      const existedUser = await this.userModel.findOne({
        username: updateUserDto.email,
        _id: { $ne: userId },
      });
      if (existedUser)
        throw new BadRequestException({ key: 'auth.emailExist' });
    }

    await this.userModel.updateOne({ _id: userId }, updateUserDto);
    const user = this.userModel.findById(userId);

    return user;
  }

  async remove(id: string) {
    const userId = getObjectId(id);

    await this.userModel.deleteOne({ _id: userId });

    return `The #${id} user is removed`;
  }
  async addPrivateRoom(author: string, receiver: string) {
    const authorId = getObjectId(author);
    const receiverId = getObjectId(receiver);

    const authorUser = await this.userModel.findById(authorId);
    const receiverUser = await this.userModel.findById(receiverId);

    if (!authorUser || !receiverUser)
      throw new BadRequestException('User not found!');

    let authorRooms = authorUser.privateRooms;
    let receiverRooms = receiverUser.privateRooms;

    authorRooms.unshift(receiverId);
    authorRooms = authorRooms.filter((item, pos, self) => {
      return self.indexOf(item) == pos;
    });

    await this.userModel.updateOne(
      { _id: authorId },
      { privateRooms: authorRooms },
    );

    receiverRooms.unshift(authorId);
    receiverRooms = receiverRooms.filter((item, pos, self) => {
      return self.indexOf(item) == pos;
    });
    await this.userModel.updateOne(
      { _id: receiverId },
      { privateRooms: receiverRooms },
    );

    return `Successfully added`;
  }

  async joinRoom(id: string, roomId: string) {
    const user = await this.findOne(id);

    if (!user) throw new NotFoundException('User not found');

    const roomIdObject = getObjectId(roomId);
    const rooms = user.rooms;
    if (rooms.findIndex((room) => room === roomIdObject) < 0) {
      rooms.push(roomIdObject);
    }

    await this.update(id, { rooms });

    return `The #${id} user joined the #${roomId} room.`;
  }

  async leaveRoom(id: string, roomId: string) {
    const user = await this.findOne(id);

    const roomIdObject = getObjectId(roomId);
    const rooms = user.rooms.filter((room) => room != roomIdObject);

    await this.update(id, { rooms });

    return `The #${id} user left the #${roomId} room.`;
  }

  async getUserRooms(id: string) {
    const userId = getObjectId(id);
    const user = await this.userModel.findById(userId).populate('rooms');

    if (!user) throw new NotFoundException('User not found');

    return user.rooms;
  }
}
