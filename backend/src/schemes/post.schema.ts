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

  @Prop({ index: 'text' })
  text: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({
    required: true,
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'File',
  })
  fileIds: File[];

  @Prop()
  locations: [number, number][];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Comment' })
  comments: Comment[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
  likedBy: User[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
  dislikedBy: User[];

  @Prop({ required: true })
  saveCount: number;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
