import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotImplementedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId } from 'mongoose';
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

  async findPostById(id: string) {
    return await this.postModel.findById(new mongoose.Types.ObjectId(id));
  }

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
      const locations = dto.locations ? JSON.parse(dto.locations) : undefined;
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
        $lookup: {
          from: 'comments',
          localField: 'comments',
          foreignField: '_id',
          as: 'comments',
          pipeline: [
            { $sort: { createdAt: -1 } },
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
              },
            },
            { $unwind: '$user' },
          ],
        },
      },
      {
        $addFields: {
          lastComment: { $arrayElemAt: ['$comments', 0] }, // Get the first comment (most recent)
        },
      },
      { $sort: { createdAt: -1 } },
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
          lastComment: {
            content: '$lastComment.content',
            user: {
              firstname: '$lastComment.user.firstname',
              lastname: '$lastComment.user.lastname',
              username: '$lastComment.user.username',
              profilePictureId: '$lastComment.user.profilePictureId',
              profilePictureUrl: '$lastComment.user.profilePictureUrl',
            },
            likedCount: { $size: { $ifNull: ['$lastComment.likedBy', []] } },
            dislikedCount: {
              $size: { $ifNull: ['$lastComment.dislikedBy', []] },
            },
          },
        },
      },
    ]);

    return postsResponse ?? [];
  }

  async addComment(postId: string, commentId: string, session?: any) {
    const updatedPost = await this.postModel.updateOne(
      { _id: new mongoose.Types.ObjectId(postId) },
      { $push: { comments: new mongoose.Types.ObjectId(commentId) } },
      { session },
    );

    if (!updatedPost.modifiedCount || !updatedPost.matchedCount) {
      throw new InternalServerErrorException(
        'Error while trying to add the commet',
      );
    }
  }

  async getPost(postId: string, userId?: string) {
    let user;
    if (userId) {
      user = await this.userService.findUserById(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }
    }
    const response = await this.postModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(postId) } },
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
        $addFields: {
          commentCount: { $size: '$comments' },
        },
      },
      {
        $lookup: {
          from: 'comments',
          localField: 'comments',
          foreignField: '_id',
          as: 'comments',
          pipeline: [
            { $sort: { createdAt: -1 } },
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
              },
            },
            { $unwind: '$user' },
            { $limit: 7 },
            {
              $project: {
                content: 1,
                user: {
                  firstname: 1,
                  lastname: 1,
                  username: 1,
                  profilePictureId: 1,
                  profilePictureUrl: 1,
                },
                likedCount: { $size: '$likedBy' },
                dislikedCount: { $size: '$dislikedBy' },
              },
            },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
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
          commentCount: 1,
          notEdited: { $eq: ['$createdAt', '$updatedAt'] },
          saveCount: 1,
          isUserLiked: user ? { $in: [user._id, '$likedBy'] } : undefined,
          isUserDisliked: user ? { $in: [user._id, '$dislikedBy'] } : undefined,
          isUserSaved: { $in: ['$_id', '$user.savedPosts'] },
          comments: 1,
        },
      },
    ]);
    return response[0]
      ? { message: 'Post retrieved successfully.', post: response[0] }
      : { message: 'Post not found.' };
  }

  async getUserPosts(page: number, userId: string) {
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const posts = await this.postModel.aggregate([
      { $match: { user: user._id } },
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
        $lookup: {
          from: 'comments',
          localField: 'comments',
          foreignField: '_id',
          as: 'comments',
          pipeline: [
            { $sort: { createdAt: -1 } },
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
              },
            },
            { $unwind: '$user' },
          ],
        },
      },
      {
        $addFields: {
          lastComment: { $arrayElemAt: ['$comments', 0] }, // Get the first comment (most recent)
        },
      },
      { $sort: { createdAt: -1 } },
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
          lastComment: {
            content: '$lastComment.content',
            user: {
              firstname: '$lastComment.user.firstname',
              lastname: '$lastComment.user.lastname',
              username: '$lastComment.user.username',
              profilePictureId: '$lastComment.user.profilePictureId',
              profilePictureUrl: '$lastComment.user.profilePictureUrl',
            },
            likedCount: { $size: { $ifNull: ['$lastComment.likedBy', []] } },
            dislikedCount: {
              $size: { $ifNull: ['$lastComment.dislikedBy', []] },
            },
          },
        },
      },
      { $skip: (page - 1) * 10 >= 0 ? (page - 1) * 10 : 0 },
      { $limit: 10 },
    ]);
    return posts ?? [];
  }

  async getUsersLikedPosts(page: number, userId: string) {
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const posts = await this.postModel.aggregate([
      { $match: { likedBy: { $in: [user._id] } } },
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
        $lookup: {
          from: 'comments',
          localField: 'comments',
          foreignField: '_id',
          as: 'comments',
          pipeline: [
            { $sort: { createdAt: -1 } },
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
              },
            },
            { $unwind: '$user' },
          ],
        },
      },
      {
        $addFields: {
          lastComment: { $arrayElemAt: ['$comments', 0] }, // Get the first comment (most recent)
        },
      },
      { $sort: { createdAt: -1 } },
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
          lastComment: {
            content: '$lastComment.content',
            user: {
              firstname: '$lastComment.user.firstname',
              lastname: '$lastComment.user.lastname',
              username: '$lastComment.user.username',
              profilePictureId: '$lastComment.user.profilePictureId',
              profilePictureUrl: '$lastComment.user.profilePictureUrl',
            },
            likedCount: { $size: { $ifNull: ['$lastComment.likedBy', []] } },
            dislikedCount: {
              $size: { $ifNull: ['$lastComment.dislikedBy', []] },
            },
          },
        },
      },
      { $skip: (page - 1) * 10 >= 0 ? (page - 1) * 10 : 0 },
      { $limit: 10 },
    ]);
    return posts ?? [];
  }

  async findManyPostsById(postIds: ObjectId[], userId: ObjectId) {
    const posts = await this.postModel.aggregate([
      { $match: { _id: { $in: postIds } } },
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
        $lookup: {
          from: 'comments',
          localField: 'comments',
          foreignField: '_id',
          as: 'comments',
          pipeline: [
            { $sort: { createdAt: -1 } },
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
              },
            },
            { $unwind: '$user' },
          ],
        },
      },
      {
        $addFields: {
          lastComment: { $arrayElemAt: ['$comments', 0] }, // Get the first comment (most recent)
        },
      },
      { $sort: { createdAt: -1 } },
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
          isUserLiked: { $in: [userId, '$likedBy'] },
          isUserDisliked: { $in: [userId, '$dislikedBy'] },
          isUserSaved: { $in: ['$_id', '$user.savedPosts'] },
          lastComment: {
            content: '$lastComment.content',
            user: {
              firstname: '$lastComment.user.firstname',
              lastname: '$lastComment.user.lastname',
              username: '$lastComment.user.username',
              profilePictureId: '$lastComment.user.profilePictureId',
              profilePictureUrl: '$lastComment.user.profilePictureUrl',
            },
            likedCount: { $size: { $ifNull: ['$lastComment.likedBy', []] } },
            dislikedCount: {
              $size: { $ifNull: ['$lastComment.dislikedBy', []] },
            },
          },
        },
      },
    ]);
    return posts ?? [];
  }
}
