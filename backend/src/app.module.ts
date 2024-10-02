import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { FileModule } from './file/file.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentModule } from './comment/comment.module';
import { MessageModule } from './message/message.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      process.env.NODE_ENV !== 'production'
        ? 'mongodb://127.0.0.1:27017/social?replicaSet=rs0'
        : process.env.DB_URL,
    ),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    PostModule,
    UserModule,
    AuthModule,
    FileModule,
    CommentModule,
    MessageModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
