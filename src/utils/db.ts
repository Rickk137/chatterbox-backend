import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

export const getObjectId = (id: string): Types.ObjectId => {
  if (!Types.ObjectId.isValid(id))
    throw new BadRequestException('Not a valid Id!');

  return Types.ObjectId(id);
};
