import { Document } from 'mongoose';

export interface User extends Document {
  id: string;
  name: string;
  family: string;
  username: string;
  password: string;
}
