import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Comment } from 'src/schemes/comment.schema';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId, startSession } from 'mongoose';
import { PostService } from 'src/post/post.service';
import { CreateAnswerDTO, CreateCommentDTO } from 'src/dto/comment.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private postService: PostService,
    private userService: UserService,
  ) {}

  async likeComment(commentId: string, userId: string) {
    const existingUser = await this.userService.findUserById(userId);
    if (!existingUser) {
      throw new BadRequestException('User not found.');
    }
    const userObjectId = existingUser._id;

    const updateResponse = await this.commentModel.updateOne(
      { _id: new mongoose.Types.ObjectId(commentId) },
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

  async dislikeComment(commentId: string, userId: string) {
    const existingUser = await this.userService.findUserById(userId);
    if (!existingUser) {
      throw new BadRequestException('User not found.');
    }
    const userObjectId = existingUser._id;

    const updateResponse = await this.commentModel.updateOne(
      { _id: new mongoose.Types.ObjectId(commentId) },
      [
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
      ],
    );

    if (!updateResponse.modifiedCount) {
      console.log(updateResponse);
      throw new InternalServerErrorException();
    }

    return { message: 'Operation handled successfully.' };
  }

  async createAnswer(dto: CreateAnswerDTO) {
    const existingUser = await this.userService.findUserById(dto.userId);
    if (!existingUser) {
      throw new BadRequestException('User not found.');
    }

    const session = await this.connection.startSession();
    await session.startTransaction();

    const commentId = new mongoose.Types.ObjectId();
    try {
      const answeredCommentObjectId = new mongoose.Types.ObjectId(dto.answerTo);
      const createdComment = await this.commentModel.create(
        [
          {
            _id: commentId,
            content: dto.content,
            user: new mongoose.Types.ObjectId(dto.userId),
            answers: [],
            likedBy: [],
            post: new mongoose.Types.ObjectId(dto.postId),
            createdAt: new Date(),
            answerTo: answeredCommentObjectId,
          },
        ],
        { session },
      );
      if (!createdComment) {
        throw new InternalServerErrorException(
          'Error while trying to create the comment',
        );
      }
      const updatedComment = await this.commentModel.updateOne(
        { _id: answeredCommentObjectId },
        { $push: { answers: commentId } },
      );
      if (!updatedComment.modifiedCount || !updatedComment.matchedCount) {
        throw new InternalServerErrorException(
          'Error while trying to create the comment',
        );
      }

      await this.postService.addComment(
        dto.postId,
        commentId.toString(),
        session,
      );
      await session.commitTransaction();
    } catch (error) {
      session.abortTransaction();
      throw new InternalServerErrorException(
        error.message ?? 'Error while trying to create the comment',
      );
    } finally {
      session.endSession();
    }
    return {
      message: 'Comment created successfully.',
      commentId: commentId,
    };
  }

  async createComment(dto: CreateCommentDTO) {
    const existingUser = await this.userService.findUserById(dto.userId);
    if (!existingUser) {
      throw new BadRequestException('User not found.');
    }
    // No need to check if post exists, postService.addComment method already tries to find and update it
    //const existingPost = await this.postService.findPostById(dto.postId);
    //if (!existingPost) {
    //  throw new BadRequestException('Post not found.');
    //}

    const session = await this.connection.startSession();
    await session.startTransaction();

    const commentId = new mongoose.Types.ObjectId();
    try {
      const createdComment = await this.commentModel.create(
        [
          {
            _id: commentId,
            content: dto.content,
            user: new mongoose.Types.ObjectId(dto.userId),
            answers: [],
            likedBy: [],
            post: new mongoose.Types.ObjectId(dto.postId),
            createdAt: new Date(),
          },
        ],
        { session },
      );
      if (!createdComment) {
        throw new InternalServerErrorException(
          'Error while trying to create the comment',
        );
      }
      await this.postService.addComment(
        dto.postId,
        commentId.toString(),
        session,
      );
      await session.commitTransaction();
    } catch (error) {
      session.abortTransaction();
      throw new InternalServerErrorException(
        error.message ?? 'Error while trying to create the comment',
      );
    } finally {
      session.endSession();
    }
    return {
      message: 'Comment created successfully.',
      commentId: commentId,
    };
  }

  async getPostComments(postId: string, page: number) {
    const comments = await this.commentModel.aggregate([
      {
        $match: { post: new mongoose.Types.ObjectId(postId) },
      },
      { $addFields: { totalCount: '$count' } },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: 1 + page * 2,
      },
      {
        $limit: 2,
      },
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
    ]);
    return { comments };
  }

  async getUserCommentedPosts(userId: string, page: number) {
    const existingUser = await this.userService.findUserById(userId);
    if (!existingUser) {
      throw new BadRequestException('User not found.');
    }

    const comments = await this.commentModel
      .find({ user: existingUser._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * 10 >= 0 ? (page - 1) * 10 : 0)
      .limit(10);

    if (!comments) {
      throw new InternalServerErrorException(
        'Error while trying to get the posts.1',
      );
    }

    const posts = await this.postService.findManyPostsById(
      comments.map((i) => i.post) as unknown as ObjectId[],
      existingUser._id,
    );
    if (!posts) {
      throw new InternalServerErrorException(
        'Error while trying to get the posts.2',
      );
    }
    return posts;
  }
}
