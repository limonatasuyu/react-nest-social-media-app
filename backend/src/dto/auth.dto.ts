export interface RegisterUserDTO {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  emailConfirmation: string;
  password: string;
  passwordConfirmation: string;
  dateOfBirth: Date;
}

export interface RegisterUserFromGoogleDTO {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  dateOfBirth: Date;
}
