import { z } from "zod"
import {
  AUTH_RULES,
  AUTH_VALIDATION_MESSAGES,
  USER_ROLES,
} from "@/constants/auth"

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, { message: AUTH_VALIDATION_MESSAGES.EMAIL_REQUIRED })
    .email({ message: AUTH_VALIDATION_MESSAGES.EMAIL_INVALID }),
  password: z
    .string()
    .min(AUTH_RULES.PASSWORD_MIN_LENGTH, {
      message: AUTH_VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH,
    }),
  role: z.enum([USER_ROLES.EMPLOYEE, USER_ROLES.HR_ADMIN]),
})

export type SignInFormValues = z.infer<typeof signInSchema>
