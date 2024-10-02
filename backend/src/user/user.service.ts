import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { DefaultCreateUserDTO, RegisterUserFromGoogleDTO } from 'src/dto/auth.dto';
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
}
