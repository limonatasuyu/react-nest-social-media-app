import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/auth.guard';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  async getUserInfo(@Req() req: Request) {
    //@ts-expect-error guard adds the userId key
    return await this.userService.getUserInfo(req.user.userId);
  }
}
