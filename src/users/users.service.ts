import { Injectable, BadRequestException } from '@nestjs/common';
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
    if (user) throw new BadRequestException('Username already exists');

    user = await this.findByEmail(payload.email);
    if (user) throw new BadRequestException('Email already exists');

    const password = await bcrypt.hash(payload.password, 10);

    const newUser = await this.userModel.create({ ...payload, password });
    return newUser;
  }

  async findAll() {
    const users = await this.userModel.find();
    return users;
  }

  async findOne(id: string) {
    const userId = getObjectId(id);
    const user = await this.userModel.findById(userId);
    return user;
  }

  async findByUsername(username: string) {
    const user = await this.userModel.findOne({ username });
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

    let existedUser = await this.userModel.findOne({
      username: updateUserDto.username,
      _id: { $ne: userId },
    });
    if (existedUser) throw new BadRequestException('Username already exists');

    existedUser = await this.userModel.findOne({
      username: updateUserDto.email,
      _id: { $ne: userId },
    });
    if (existedUser) throw new BadRequestException('Email already exists');

    await this.userModel.updateOne({ _id: userId }, updateUserDto);
    const user = this.userModel.findById(userId);

    return user;
  }

  async remove(id: string) {
    const userId = getObjectId(id);

    await this.userModel.deleteOne({ _id: userId });

    return `The #${id} user is removed`;
  }
}
