import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MessagesService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messageService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    return this.messageService.create(createMessageDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req, @Query() { limit, skip }) {
    return this.messageService.findAll(limit, skip);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/rooms/:id')
  getRoomMessages(@Param('id') roomId: string, @Query() { limit, timestamp }) {
    if (limit) limit = parseInt(limit);
    return this.messageService.getRoomMessages(roomId, timestamp, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/pv/:id')
  getUserMessages(
    @Request() req,
    @Param('id') userId: string,
    @Query() { limit, timestamp },
  ) {
    if (limit) limit = parseInt(limit);

    return this.messageService.getUserMessages(
      userId,
      req.user.userId,
      timestamp,
      limit,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messageService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messageService.update(id, updateMessageDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.messageService.remove(id, req.user.userId);
  }
}
