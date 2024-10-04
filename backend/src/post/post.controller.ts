import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
//import { diskStorage } from 'multer';
import { PostService } from './post.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async handlePost(
    @UploadedFiles() files: Array<Express.Multer.File>, // Files will be uploaded here
    @Body() formData: any, // Other form data will be available in the body
  ) {
    console.log('test');
    return await this.postService.uploadPost({ ...formData, files });
  }
}
