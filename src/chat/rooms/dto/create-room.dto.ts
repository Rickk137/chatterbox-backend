import { Member } from '../entities/room.entity';

export class CreateRoomDto {
  name: string;
  icon: string;
  members: Member[];
}
