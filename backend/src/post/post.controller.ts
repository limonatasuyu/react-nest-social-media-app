import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Body,
  Req,
  Get,
  UseGuards,
  Param,
} from '@nestjs/common';
import { PostService } from './post.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/auth.guard';

@Controller('post')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private postService: PostService) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async handlePost(
    @UploadedFiles() files: Array<Express.Multer.File>, // Files will be uploaded here
    @Body() formData: any, // Other form data will be available in the body
    @Req() req: Request,
  ) {
    return await this.postService.uploadPost({
      ...formData,
      files,
      //@ts-expect-error guard adds the userId key
      userId: req.user.userId,
    });
  }

  @Get()
  async getHomePosts(@Req() req: Request) {
    //@ts-expect-error guard adds the userId key
    return await this.postService.getHomePosts(req.user.userId);
  }

  @Post('like/:id')
  async likePost(@Req() req: Request, @Param('id') id: string) {
    //@ts-expect-error guard adds the userId key
    return await this.postService.likePost(req.user.userId, id);
  }

  @Post('dislike/:id')
  async dislikePost(@Req() req: Request, @Param('id') id: string) {
    //@ts-expect-error guard adds the userId key
    return await this.postService.dislikePost(req.user.userId, id);
  }

  @Post('save/:id')
  async savePost(@Req() req: Request, @Param('id') id: string) {
    //@ts-expect-error guard adds the userId key
    return await this.postService.savePost(req.user.userId, id);
  }

}
