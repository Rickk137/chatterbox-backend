import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('media')
export class MediaController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: './public',
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      file,
    };
  }
}
