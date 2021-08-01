import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { getObjectId } from 'src/utils/db';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(payload: CreateUserDto) {
    const newUser = await this.userModel.create(payload);
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

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userId = getObjectId(id);

    delete updateUserDto.password;

    const user = await this.userModel.updateOne({ _id: userId }, updateUserDto);

    return user;
  }

  async remove(id: string) {
    const userId = getObjectId(id);

    await this.userModel.deleteOne({ _id: userId });

    return `The #${id} user is removed`;
  }
}
