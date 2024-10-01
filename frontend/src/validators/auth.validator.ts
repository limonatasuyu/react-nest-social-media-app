import * as Yup from 'yup';
import { InferType } from 'yup';

export const loginSchema = Yup.object().shape({
  email: Yup.string().email().required('Email is required.'),
  password: Yup.string().required('Password is required.')
})

export type LoginSchema = InferType<typeof loginSchema>
