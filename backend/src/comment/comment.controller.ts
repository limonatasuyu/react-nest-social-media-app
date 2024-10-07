import {
  Controller,
  Post,
  Req,
  UseGuards,
  Param,
  Body,
  Query,
  Get,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/auth.guard';

@Controller('comment')
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Post(':postId')
  async addComment(
    @Req() req: Request,
    @Param('postId') postId: string,
    @Body() { content }: { content: string },
  ) {
    return await this.commentService.createComment({
      //@ts-expect-error guard adds the userId key
      userId: req.user.userId,
      postId,
      content,
    });
  }

  @Post('like/:comentId')
  async likeComment(
    @Req() req: Request,
    @Param('commentId') commentId: string,
  ) {
    //@ts-expect-error guard adds the userId key
    return await this.commentService.likeComment(commentId, req.user.userId);
  }

  @Post('dislike/:comentId')
  async dislikeComment(
    @Req() req: Request,
    @Param('commentId') commentId: string,
  ) {
    //@ts-expect-error guard adds the userId key
    return await this.commentService.dislikeComment(commentId, req.user.userId);
  }

  @Get('postComments')
  async getPostComments(
    @Query('postId') postId: string,
    @Query('page') page: number,
  ) {
    return await this.commentService.getPostComments(postId, page);
  }

}
