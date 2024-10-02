import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { DefaultRegisterUserDTO, LoginDTO } from 'src/dto/auth.dto';
import { compare } from 'bcrypt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  generateJwt(user: any) {
    const payload = { sub: String(user._id), email: user.email };
    return this.jwtService.sign(payload);
  }

  async validateUser(payload: any): Promise<any> {
    return await this.userService.findUserById(payload.sub);
  }

  async register(dto: DefaultRegisterUserDTO) {
    if (dto.email !== dto.emailConfirmation)
      throw new BadRequestException('Emails does not match.');
    if (dto.password !== dto.passwordConfirmation)
      throw new BadRequestException('Passwords does not match.');

    const emailRegex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!dto.email.match(emailRegex))
      throw new BadRequestException('Email is not valid.');
    if (dto.password.length < 6 || dto.password.length > 20)
      throw new BadRequestException(
        "Password can't be shorter then 6 or longer then 20 characters",
      );

    const existingUser = await this.userService.findUserByEmail(dto.email);
    if (existingUser) throw new BadRequestException('Email is already in use.');

    const saltRounds = 10;
    const encryptedPassword = await bcrypt.hash(dto.password, saltRounds);

    const createdUser = await this.userService.createUser({
      username: dto.username,
      firstname: dto.firstname,
      lastname: dto.lastname,
      email: dto.email,
      password: encryptedPassword,
      dateOfBirth: new Date(dto.dateOfBirth),
      signMethod: 'default',
    });

    if (!createdUser) throw new InternalServerErrorException();
    return { message: 'User created successfully.' };
  }

  async login(dto: LoginDTO) {
    const user = await this.userService.findUserByEmail(dto.email);
    if (user.signMethod === 'google')
      throw new BadRequestException(
        'User signed via google, please login with google',
      );

    const { password, _id, email } = user;

    const isPasswordsMatch = await compare(dto.password, password);

    if (!isPasswordsMatch) {
      throw new UnauthorizedException('Email or password is incorrect.');
    }
    const payload = { sub: _id, email };

    return {
      access_token: await this.jwtService.signAsync(payload),
      message: 'Login successfull.',
    };
  }
}
