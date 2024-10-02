import * as Yup from "yup";
import { InferType } from "yup";

export const loginSchema = Yup.object().shape({
  email: Yup.string().email().required("Email is required."),
  password: Yup.string().required("Password is required."),
});

export type LoginSchema = InferType<typeof loginSchema>;

export const registerSchema = Yup.object().shape({
  firstname: Yup.string().required("First name is required"),
  lastname: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  emailConfirmation: Yup.string()
    .oneOf([Yup.ref("email")], "Emails must match")
    .required("Email confirmation is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  passwordConfirmation: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Password confirmation is required"),
  username: Yup.string().required("Username is required"),
  dateOfBirth: Yup.date().required("Date of birth is required"),
});

export type RegisterSchema = InferType<typeof registerSchema>;
