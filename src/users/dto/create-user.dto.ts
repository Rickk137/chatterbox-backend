import { Types } from 'mongoose';
export class CreateUserDto {
  name: string;
  family: string;
  email: string;
  username: string;
  password: string;
  rooms: Types.ObjectId[];
  privateRooms: Types.ObjectId[];
}
