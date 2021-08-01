import { Document, Types } from 'mongoose';

export interface Room extends Document {
  id: string;
  name: string;
  icon: string;
  members: Member[];
}

export enum Role {
  OWNER,
  ADMIN,
  USER,
}

export interface Member {
  userId: Types.ObjectId;
  role: Role;
}
