import {
  Controller,
  Get,
  Res,
  Req,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { DefaultRegisterUserDTO, LoginDTO } from 'src/dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Get('google')
  @UseGuards(AuthGuard('google'))
  authWithGoogle() {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  googleRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user;

    const token = this.authService.generateJwt(user);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    //@ts-expect-error im returning the key
    const redirectUrl = `http://localhost:5173${!user.dateOfBirth ? '?isDateOfBirthSet=false' : ''}`;

    res.redirect(redirectUrl);
  }

  @Post('register')
  async register(@Body() dto: DefaultRegisterUserDTO) {
    return await this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDTO) {
    return await this.authService.login(dto);
  }
}
