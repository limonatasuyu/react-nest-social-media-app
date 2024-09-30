import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';
import { Comment } from './comment.schema';
import { File } from './file.schema';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop({ required: true })
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, index: 'text' })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Comment' })
  comments: Comment[];

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;

  @Prop({
    required: true,
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'File',
  })
  fileIds: File[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
  likedBy: User[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
