import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export const SIGN_IN_VALIDATION_MESSAGES = {
  EMAIL_INVALID: 'Must be a valid email address',
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_STRING: 'Password must be a string',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters long',
} as const;

export const SIGN_IN_VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
} as const;

export class SignInDto {
  @IsEmail({}, { message: SIGN_IN_VALIDATION_MESSAGES.EMAIL_INVALID })
  @IsNotEmpty({ message: SIGN_IN_VALIDATION_MESSAGES.EMAIL_REQUIRED })
  email: string;

  @IsString({ message: SIGN_IN_VALIDATION_MESSAGES.PASSWORD_STRING })
  @IsNotEmpty({ message: SIGN_IN_VALIDATION_MESSAGES.PASSWORD_REQUIRED })
  @MinLength(SIGN_IN_VALIDATION_RULES.PASSWORD_MIN_LENGTH, {
    message: SIGN_IN_VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH,
  })
  password: string;
}
