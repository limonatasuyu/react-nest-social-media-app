export interface DefaultRegisterUserDTO {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  emailConfirmation: string;
  password: string;
  passwordConfirmation: string;
  dateOfBirth: Date;
  signMethod: 'default';
}

export interface RegisterUserFromGoogleDTO {
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  dateOfBirth: Date;
  profilePictureId?: string;
  refreshToken: string;
  signMethod: 'google';
}

export interface DefaultCreateUserDTO {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  signMethod: 'default';
}

export interface LoginDTO {
  email: string;
  password: string;
}
