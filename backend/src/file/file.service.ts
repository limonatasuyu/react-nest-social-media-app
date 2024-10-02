import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  /*CreateBucketCommand,
  DeleteBucketCommand,
  paginateListObjectsV2*/
} from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { File } from 'src/schemes/file.schema';

@Injectable()
export class FileService {
  bucketName = process.env.AWS_S3_BUCKET_NAME;
  s3Client = new S3Client({
    region: 'us-east-2',
    credentials: {
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
      accessKeyId: process.env.ACCESS_KEY_ID,
    },
  });

  constructor(@InjectModel(File.name) private fileModel: Model<File>) {}

  async uploadFile(file: Express.Multer.File) {
    const { /*originalname, */ mimetype } = file;

    const fileKey = uuid();
    await this.uploadToS3(file.buffer, fileKey);

    const createdFile = await this.fileModel.create({
      fileKey,
      mimeType: mimetype,
      user: new mongoose.Types.ObjectId(),
      createdAt: new Date(),
      isRelated: false,
    });

    if (!createdFile) {
      await this.deleteFromS3(fileKey);
      throw new InternalServerErrorException();
    }

    return { message: 'File uploaded successfully.' };
  }

  async uploadToS3(file: Buffer, fileKey: string) {
    try {
      return await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileKey,
          Body: file,
        }),
      );
    } catch (err) {
      console.error(`Error while trying to upload the file: ${err}`);
      throw new InternalServerErrorException(
        'Error while trying to upload the file.',
      );
    }
  }

  async relateFile(fileId: string) {
    if (!fileId /* || !mongoose.isValidObjectId(fileId)*/) {
      throw new BadRequestException('Image not found.');
    }

    const updatedFile = await this.fileModel.updateOne(
      { _id: fileId },
      { isRelated: true },
    );

    if (!updatedFile.matchedCount) {
      throw new BadRequestException('Image not found.');
    }

    return { message: 'File related successfully.' };
  }

  async getFile(fileId: string) {
    if (!fileId /* || !mongoose.isValidObjectId(fileId)*/) {
      throw new BadRequestException('File not found.');
    }

    const file = await this.fileModel.findOne({
      _id: new mongoose.Types.ObjectId(fileId),
      isRelated: true,
    });

    if (!file) {
      throw new BadRequestException('File not found.');
    }

    try {
      const { Body } = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: file.fileKey,
        }),
      );
      const data = await Body.transformToByteArray();
      return {data: Buffer.from(data), mimetype: file.mimeType}
    } catch (err) {
      console.error(`Error while trying to get the file: ${err}`);
      throw new InternalServerErrorException(
        'Error while trying to upload the file.',
      );
    }
  }

  async deleteFile(fileId: string) {
    if (!fileId /* || !mongoose.isValidObjectId(fileId)*/) {
      throw new BadRequestException('File not found.');
    }

    const file = await this.fileModel.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(fileId),
      isRelated: true,
    });

    if (!file) {
      throw new BadRequestException('File not found.');
    }

    await this.deleteFromS3(file.fileKey);
    return { message: 'File deleted successfully.' };
  }

  async deleteFromS3(fileKey: string) {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: fileKey,
        })
      );
    } catch (err) {
      console.error(`Error while trying to delete the file: ${err}`);
      throw new InternalServerErrorException();
    }
  }
}
