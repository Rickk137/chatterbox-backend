import { Document } from 'mongoose';

export interface User extends Document {
  id: string;
  name: string;
  family: string;
  email: string;
  username: string;
  password: string;
}
