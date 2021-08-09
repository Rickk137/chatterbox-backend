import { UpdateUserDto } from './../users/dto/update-user.dto';
import { CreateUserDto } from './../users/dto/create-user.dto';
import { Request, Post, Patch, UseGuards, Get, Body } from '@nestjs/common';
import { Controller } from '@nestjs/common';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    const user = this.authService.getUserInfo(req.user.userId);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(@Body() updateUserDto: UpdateUserDto, @Request() req) {
    const user = await this.authService.update(req.user.userId, updateUserDto);
    return user;
  }

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.signup(createUserDto);
    return this.authService.login(user);
  }
}
