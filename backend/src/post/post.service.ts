import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Post } from 'src/schemes/post.schema';
import { UploadPostDTO } from 'src/dto/post.dto';
import { FileService } from 'src/file/file.service';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    private fileService: FileService,
  ) {}

  async uploadPost(dto: UploadPostDTO) {
    console.log('dto: ', dto);
    try {
      const fileIds = [];
      if (dto.files) {
        for (const file of dto.files) {
          const { fileId } = await this.fileService.uploadFile(file);
          fileIds.push(fileId);
        }
      }
      const createdPost = await this.postModel.create({
        text: dto.text,
        user: new mongoose.Types.ObjectId(dto.userId),
        comments: [],
        likedBy: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        fileIds,
        locations: dto.locations,
      });
      if (!createdPost) {
        throw new InternalServerErrorException(
          'Error while trying to create post',
        );
      }

      if (dto.files.length) await this.fileService.relateFileBulk(fileIds);

      return { message: 'Post uploaded successfuly.' };
    } catch (error) {
      console.error('Error while trying to upload a post: ' + error);
      throw new InternalServerErrorException(
        'Error while trying to upload the post',
      );
    }
  }
}
