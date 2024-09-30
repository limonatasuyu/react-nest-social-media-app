import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { File } from './file.schema';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema()
export class Notification {
  @Prop({ required: true })
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  content: boolean;

  @Prop({
    required: true,
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'File',
  })
  fileIds: File[];

  @Prop({ required: true })
  isSeen: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
