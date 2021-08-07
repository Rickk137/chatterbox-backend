import { UpdateUserDto } from './../users/dto/update-user.dto';
import { CreateUserDto } from './../users/dto/create-user.dto';
import { UsersService } from './../users/users.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (!user) return null;

    const isMatch = await bcrypt.compare(pass, user.password);
    if (isMatch) {
      return user;
    }

    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user._id };
    const { _id, name, family, username } = user;
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: _id, name, family, username },
    };
  }

  async signup(payload: CreateUserDto) {
    const { name, family, username, password } = payload;
    const user = await this.usersService.create({
      name,
      family,
      username,
      password,
    });
    return user;
  }

  async update(id: string, payload: UpdateUserDto) {
    const user = await this.usersService.update(id, payload);
    return user;
  }
}
