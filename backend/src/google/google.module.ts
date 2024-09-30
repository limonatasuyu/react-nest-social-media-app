import { Module } from '@nestjs/common';
import { GoogleStrategy } from './google.strategy';
import { GoogleController } from './google.controller';
import { GoogleService } from './google.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [GoogleController],
  providers: [GoogleStrategy, GoogleService],
})
export class GoogleModule {}
