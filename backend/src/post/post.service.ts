import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotImplementedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Post } from 'src/schemes/post.schema';
import { UploadPostDTO } from 'src/dto/post.dto';
import { FileService } from 'src/file/file.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    private fileService: FileService,
    private userService: UserService,
  ) {}

  async uploadPost(dto: UploadPostDTO) {
    const user = await this.userService.findUserById(dto.userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    try {
      const fileIds = [];
      if (dto.files) {
        for (const file of dto.files) {
          const { fileId } = await this.fileService.uploadFile(file);
          fileIds.push(fileId);
        }
      }
      let verifiedLocations;
      const locations = JSON.parse(dto.locations);
      if (
        Array.isArray(locations) &&
        locations.every(
          (item) =>
            Array.isArray(item) &&
            item.length === 2 &&
            typeof item[0] === 'number' &&
            typeof item[1] === 'number',
        )
      ) {
        verifiedLocations = locations;
      }
      const createdPost = await this.postModel.create({
        _id: new mongoose.Types.ObjectId(),
        text: dto.text,
        user: new mongoose.Types.ObjectId(dto.userId),
        comments: [],
        likedBy: [],
        dislikedBy: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        fileIds,
        locations: verifiedLocations,
        saveCount: 0,
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

  async likePost(userId: string, postId: string) {
    const existingUser = await this.userService.findUserById(userId);
    if (!existingUser) throw new BadRequestException('User not found.');

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const updateResponse = await this.postModel.updateOne(
      { _id: new mongoose.Types.ObjectId(postId) },
      [
        {
          $set: {
            likedBy: {
              $cond: {
                if: { $in: [userObjectId, '$likedBy'] },
                then: {
                  $filter: {
                    input: '$likedBy',
                    as: 'user',
                    cond: { $ne: ['$$user', userObjectId] },
                  },
                },
                else: {
                  $concatArrays: ['$likedBy', [userObjectId]],
                },
              },
            },
            dislikedBy: {
              $filter: {
                input: '$dislikedBy',
                as: 'user',
                cond: { $ne: ['$$user', userObjectId] },
              },
            },
          },
        },
      ],
    );

    if (!updateResponse.modifiedCount) {
      console.log(updateResponse);
      throw new InternalServerErrorException();
    }

    return { message: 'Operation handled successfully.' };
  }

  async dislikePost(userId: string, postId: string) {
    const existingUser = await this.userService.findUserById(userId);
    if (!existingUser) throw new BadRequestException('User not found.');

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const updateResponse = await this.postModel.updateOne({ _id: postId }, [
      {
        $set: {
          dislikedBy: {
            $cond: {
              if: { $in: [userObjectId, '$dislikedBy'] },
              then: {
                $filter: {
                  input: '$dislikedBy',
                  as: 'user',
                  cond: { $ne: ['$$user', userObjectId] },
                },
              },
              else: {
                $concatArrays: ['$dislikedBy', [userObjectId]],
              },
            },
          },
          likedBy: {
            $filter: {
              input: '$likedBy',
              as: 'user',
              cond: { $ne: ['$$user', userObjectId] },
            },
          },
        },
      },
    ]);

    if (!updateResponse.modifiedCount) {
      throw new InternalServerErrorException();
    }

    return { message: 'Operation handled successfully.' };
  }

  async savePost(userId: string, postId: string) {
    const updatedUserResponse = await this.userService.addOrRemoveSavedPost(
      userId,
      postId,
    );

    const updateResponse = await this.postModel.updateOne(
      { _id: new mongoose.Types.ObjectId(postId) },
      {
        $inc: { saveCount: updatedUserResponse.isSaved ? 1 : -1 },
      },
    );

    if (!updateResponse.modifiedCount) {
      throw new InternalServerErrorException();
    }

    return { message: 'Operation handled successfully.' };
  }

  async getHomePosts(userId?: string) {
    if (!userId)
      throw new NotImplementedException(
        'Home posts for guests is not implemented yet.',
      );
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const postsResponse = await this.postModel.aggregate([
      { $match: {} },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'files',
          localField: 'fileIds',
          foreignField: '_id',
          as: 'files',
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          text: 1,
          user: {
            firstname: 1,
            lastname: 1,
            username: 1,
            profilePictureId: 1,
            profilePictureUrl: 1,
          },
          files: {
            mimeType: 1,
            _id: 1,
            name: 1,
          },
          locations: 1,
          likeCount: { $size: '$likedBy' },
          dislikeCount: { $size: '$dislikedBy' },
          commentCount: { $size: '$comments' },
          notEdited: { $eq: ['$createdAt', '$updatedAt'] },
          saveCount: 1,
          isUserLiked: { $in: [user._id, '$likedBy'] },
          isUserDisliked: { $in: [user._id, '$dislikedBy'] },
          isUserSaved: { $in: ['$_id', '$user.savedPosts'] },
        },
      },
    ]);
    return postsResponse ?? [];
  }
}
