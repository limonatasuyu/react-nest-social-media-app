import {
  Controller,
  UploadedFile,
  UseInterceptors,
  Post,
  Param,
  Get,
  Res,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.fileUploadService.uploadFile(file);
  }

  @Get(':filename')
  async getFile(
    @Param() { filename }: { filename: string },
    @Res() res: Response,
  ) {
    const file = await this.fileUploadService.getFile(filename);
    res.set('Content-Type', file.mimetype); // Adjust the MIME type as necessary
    res.send(file.data);
  }
}
