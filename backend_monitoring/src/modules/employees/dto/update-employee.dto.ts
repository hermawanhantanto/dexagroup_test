import {
  IsEmail,
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Gender, Role } from '../../../generated/prisma/enums.js';
import {
  EMPLOYEE_VALIDATION_MESSAGES,
  EMPLOYEE_VALIDATION_RULES,
} from '../employee.constants.js';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsEmail({}, { message: EMPLOYEE_VALIDATION_MESSAGES.EMAIL_INVALID })
  email?: string;

  @IsOptional()
  @IsString({ message: EMPLOYEE_VALIDATION_MESSAGES.PASSWORD_STRING })
  @MinLength(EMPLOYEE_VALIDATION_RULES.PASSWORD_MIN_LENGTH, {
    message: EMPLOYEE_VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH,
  })
  password?: string;

  @IsOptional()
  @IsString({ message: EMPLOYEE_VALIDATION_MESSAGES.FIRST_NAME_STRING })
  firstName?: string;

  @IsOptional()
  @IsString({ message: EMPLOYEE_VALIDATION_MESSAGES.LAST_NAME_STRING })
  lastName?: string;

  @IsOptional()
  @IsString({ message: EMPLOYEE_VALIDATION_MESSAGES.POSITION_STRING })
  position?: string;

  @IsOptional()
  @IsString({ message: EMPLOYEE_VALIDATION_MESSAGES.DEPARTMENT_STRING })
  department?: string;

  @IsOptional()
  @IsISO8601(
    {},
    { message: EMPLOYEE_VALIDATION_MESSAGES.DATE_OF_BIRTH_INVALID },
  )
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(Gender, { message: EMPLOYEE_VALIDATION_MESSAGES.GENDER_INVALID })
  gender?: Gender;

  @IsOptional()
  @IsEnum(Role, { message: EMPLOYEE_VALIDATION_MESSAGES.ROLE_INVALID })
  role?: Role;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: EMPLOYEE_VALIDATION_RULES.SALARY_MAX_DECIMAL_PLACES },
    { message: EMPLOYEE_VALIDATION_MESSAGES.SALARY_NUMBER },
  )
  @Min(EMPLOYEE_VALIDATION_RULES.SALARY_MIN, {
    message: EMPLOYEE_VALIDATION_MESSAGES.SALARY_MIN,
  })
  salary?: number;

  @IsOptional()
  @IsISO8601({}, { message: EMPLOYEE_VALIDATION_MESSAGES.JOIN_DATE_INVALID })
  joinDate?: string;
}
