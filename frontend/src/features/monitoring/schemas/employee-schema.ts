import { z } from "zod"
import {
  MONITORING_CONSTRAINTS,
  MONITORING_GENDERS,
  MONITORING_ROLES,
  MONITORING_VALIDATION_MESSAGES,
} from "@/constants/monitoring"

export const createEmployeeSchema = z.object({
  email: z
    .string()
    .min(1, { message: MONITORING_VALIDATION_MESSAGES.EMAIL_REQUIRED })
    .email({ message: MONITORING_VALIDATION_MESSAGES.EMAIL_INVALID }),
  password: z
    .string()
    .min(MONITORING_CONSTRAINTS.PASSWORD_MIN_LENGTH, {
      message: MONITORING_VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH,
    }),
  firstName: z
    .string()
    .min(1, { message: MONITORING_VALIDATION_MESSAGES.FIRST_NAME_REQUIRED }),
  lastName: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z
    .enum([MONITORING_GENDERS.MALE, MONITORING_GENDERS.FEMALE], {
      message: MONITORING_VALIDATION_MESSAGES.GENDER_INVALID,
    })
    .optional()
    .or(z.literal("")),
  role: z.enum([MONITORING_ROLES.EMPLOYEE, MONITORING_ROLES.HR_ADMIN], {
    message: MONITORING_VALIDATION_MESSAGES.ROLE_INVALID,
  }),
  salary: z
    .string()
    .optional()
    .refine(
      (salaryValue) => {
        if (!salaryValue || salaryValue.trim() === "") {
          return true
        }
        const numericSalary = Number(salaryValue)
        return (
          !isNaN(numericSalary) &&
          numericSalary >= MONITORING_CONSTRAINTS.SALARY_MIN
        )
      },
      { message: MONITORING_VALIDATION_MESSAGES.SALARY_MIN },
    ),
  joinDate: z.string().optional(),
})

export const editEmployeeSchema = z.object({
  email: z
    .string()
    .min(1, { message: MONITORING_VALIDATION_MESSAGES.EMAIL_REQUIRED })
    .email({ message: MONITORING_VALIDATION_MESSAGES.EMAIL_INVALID }),
  password: z
    .string()
    .optional()
    .refine(
      (passwordValue) =>
        !passwordValue ||
        passwordValue.length >= MONITORING_CONSTRAINTS.PASSWORD_MIN_LENGTH,
      { message: MONITORING_VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH },
    ),
  firstName: z
    .string()
    .min(1, { message: MONITORING_VALIDATION_MESSAGES.FIRST_NAME_REQUIRED }),
  lastName: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z
    .enum([MONITORING_GENDERS.MALE, MONITORING_GENDERS.FEMALE], {
      message: MONITORING_VALIDATION_MESSAGES.GENDER_INVALID,
    })
    .optional()
    .or(z.literal("")),
  role: z.enum([MONITORING_ROLES.EMPLOYEE, MONITORING_ROLES.HR_ADMIN], {
    message: MONITORING_VALIDATION_MESSAGES.ROLE_INVALID,
  }),
  salary: z
    .string()
    .optional()
    .refine(
      (salaryValue) => {
        if (!salaryValue || salaryValue.trim() === "") {
          return true
        }
        const numericSalary = Number(salaryValue)
        return (
          !isNaN(numericSalary) &&
          numericSalary >= MONITORING_CONSTRAINTS.SALARY_MIN
        )
      },
      { message: MONITORING_VALIDATION_MESSAGES.SALARY_MIN },
    ),
  joinDate: z.string().optional(),
})

export type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>
export type EditEmployeeFormValues = z.infer<typeof editEmployeeSchema>
