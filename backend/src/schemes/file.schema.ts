import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';

export type FileDocument = HydratedDocument<File>;

@Schema()
export class File {
  //@Prop({ required: true })
  //_id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  fileKey: string;

  @Prop({ required: true })
  mimeType:
    | 'image/apng'
    | 'image/avif'
    //| 'image/bmp'
    | 'image/gif'
    //| 'image/vnd.microsoft.icon'
    | 'image/jpeg'
    | 'image/png'
    | 'image/svg+xml'
    //| 'image/tiff'*/
    | 'image/webp'
    | 'video/x-msvideo' //.avi
    | 'video/mp4'
    | 'video/mpeg'
    | 'video/ogg'
    //| 'video/mp2t'
    | 'video/webm'
    | 'video/3gpp'
    | 'video/3gpp2'
    | 'audio/aac'
    //| 'application/x-cdf'
    | 'audio/midi'
    | 'audio/x-midi'
    | 'audio/mpeg'
    | 'audio/ogg'
    | 'audio/wav'
    | 'audio/webm'
    | 'audio/3gpp'
    | 'audio/3gpp2';

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  isRelated: boolean;

  @Prop()
  name: string;
}

export const FileSchema = SchemaFactory.createForClass(File);
