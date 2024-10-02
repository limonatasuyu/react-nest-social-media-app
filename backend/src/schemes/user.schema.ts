import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Post } from './post.schema';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  //@Prop({ required: true })
  //_id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, unique: true, index: 'text' })
  username: string;

  @Prop({ required: true, index: 'text' })
  firstname: string;

  @Prop({ required: true, index: 'text' })
  lastname: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  dateOfBirth: Date;

  @Prop()
  interests: string[];

  @Prop()
  profilePictureId: string;

  @Prop()
  profilePictureUrl: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'post' })
  savedPosts: Post[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'post' })
  posts: Post[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'post' })
  likedPosts: Post[];

  @Prop()
  description: string;

  @Prop()
  passwordLastUpdatedAt: Date;

  @Prop({ required: true, type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
  followers: User[];

  @Prop()
  refreshToken: string;

  @Prop({ required: true })
  signMethod: 'google' | 'default';
}

export const UserSchema = SchemaFactory.createForClass(User);
