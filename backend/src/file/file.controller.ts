import {
  Controller,
  UploadedFile,
  UseInterceptors,
  Post,
  Param,
  Get,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FileService } from './file.service';

@Controller('file')
export class FileController {
  constructor(private readonly FileService: FileService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.FileService.uploadFile(file);
  }

  @Get(':fileId')
  async getFile(@Param() { fileId }: { fileId: string }, @Res() res: Response) {
    const file = await this.FileService.getFile(fileId);
    res.set('Content-Type', file.mimetype);

    const fileName = file.name || 'default-filename.ext';
    res.set('Content-Disposition', `inline; filename="${fileName}"`);
    res.send(file.data);
  }
}
