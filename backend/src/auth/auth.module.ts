import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { HttpModule } from '@nestjs/axios';
import { JwtStrategy } from 'src/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    UserModule,
    HttpModule
  ],
  providers: [AuthService, GoogleStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
