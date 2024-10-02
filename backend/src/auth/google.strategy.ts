import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';
import { UserService } from 'src/user/user.service';
import { generateUsername } from 'unique-username-generator';
import { RegisterUserFromGoogleDTO } from 'src/dto/auth.dto';
import { AuthService } from './auth.service';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

config();

interface GoogleProfile {
  name: {
    givenName: string;
    familyName: string;
  };
  emails: { value: string }[];
  photos: { value: string }[];
  id: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private readonly httpService: HttpService,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: [
        'profile',
        'email',
        'https://www.googleapis.com/auth/user.birthday.read',
      ],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;

    const peopleApiUrl =
      'https://people.googleapis.com/v1/people/me?personFields=birthdays';

    const dateOfBirthResponse = await firstValueFrom(
      this.httpService
        .get(peopleApiUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .pipe(
          catchError((error: AxiosError) => {
            console.error(
              'Error fetching date of birth:',
              JSON.stringify(error),
            );
            throw new Error('Could not fetch date of birth from Google API');
          }),
        ),
    );

    let dateOfBirth;
    if (
      dateOfBirthResponse.data.birthdays &&
      dateOfBirthResponse.data.birthdays.length > 0
    ) {
      let month, day, year;

      for (const i of dateOfBirthResponse.data.birthdays) {
        month = i.date.month;
        day = i.date.day;
        year = i.date.year;
      }
      if (month && day && year) {
        dateOfBirth = new Date(year, month - 1, day);
      }
    }
    const email = emails[0].value;
    let user = await this.userService.findUserByEmail(email);
    if (!user) {
      const userDTO: RegisterUserFromGoogleDTO = {
        firstname: name.givenName,
        lastname: name.familyName,
        email,
        username: generateUsername(email.split('@')[0], 5),
        dateOfBirth,
        profilePictureUrl: photos[0].value,
        refreshToken,
        signMethod: 'google',
      };

      user = await this.userService.createUser(userDTO);
    }
    done(null, user);
  }
}
