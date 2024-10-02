import {
  Controller,
  UploadedFile,
  UseInterceptors,
  Post,
  Param,
  Get,
  Res,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('file')
export class FileController {
  constructor(private readonly FileService: FileService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.FileService.uploadFile(file);
  }

  @Get(':filename')
  async getFile(
    @Param() { filename }: { filename: string },
    @Res() res: Response,
  ) {
    const file = await this.FileService.getFile(filename);
    res.set('Content-Type', file.mimetype); // Adjust the MIME type as necessary
    res.send(file.data);
  }
}
