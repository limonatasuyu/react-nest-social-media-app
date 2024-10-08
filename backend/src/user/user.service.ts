import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import {
  DefaultCreateUserDTO,
  RegisterUserFromGoogleDTO,
} from 'src/dto/auth.dto';
import { User } from 'src/schemes/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findUserByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async createUser(dto: DefaultCreateUserDTO | RegisterUserFromGoogleDTO) {
    const createdUser = await this.userModel.create(dto);
    if (!createdUser) {
      console.error('Error happened while trying to create the user');
      throw new InternalServerErrorException(
        'Error happened while trying to create the user',
      );
    }

    return createdUser;
  }

  async findUserById(id: string) {
    return await this.userModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });
  }

  async addOrRemoveSavedPost(userId: string, postId: string) {
    const postObjectId = new mongoose.Types.ObjectId(postId);
    const userResponse = await this.userModel.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(userId),
      },
      [
        {
          $set: {
            savedPosts: {
              $cond: {
                if: { $in: [postObjectId, '$savedPosts'] },
                then: {
                  $filter: {
                    input: '$savedPosts',
                    as: 'post',
                    cond: { $ne: ['$$post', postObjectId] },
                  },
                },
                else: {
                  $concatArrays: ['$savedPosts', [postObjectId]],
                },
              },
            },
          },
        },
      ],
      { new: true },
    );

    let isSaved = false;
    //@ts-expect-error actually what is given to savedPosts array is not a Post object but an objectId representing a Post object in posts collection
    if (userResponse.savedPosts.includes(postObjectId)) {
      isSaved = true;
    }

    return { message: 'Operation handled successfully.', isSaved };
  }

  async getUserInfo(userId: string) {
    const user = await this.userModel
      .findById(new mongoose.Types.ObjectId(userId))
      .populate('firstname lastname username');

    return user;
  }
}
