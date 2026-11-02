import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Gender, Role } from '../../../generated/prisma/enums.js';
import {
  EMPLOYEE_CONSTANTS,
  EMPLOYEE_VALIDATION_MESSAGES,
} from '../employee.constants.js';

export class GetEmployeesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: EMPLOYEE_VALIDATION_MESSAGES.PAGE_INT })
  @Min(EMPLOYEE_CONSTANTS.MIN_PAGE, {
    message: EMPLOYEE_VALIDATION_MESSAGES.PAGE_MIN,
  })
  page?: number = EMPLOYEE_CONSTANTS.DEFAULT_PAGE;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: EMPLOYEE_VALIDATION_MESSAGES.LIMIT_INT })
  @Min(EMPLOYEE_CONSTANTS.MIN_LIMIT, {
    message: EMPLOYEE_VALIDATION_MESSAGES.LIMIT_MIN,
  })
  @Max(EMPLOYEE_CONSTANTS.MAX_LIMIT, {
    message: EMPLOYEE_VALIDATION_MESSAGES.LIMIT_MAX,
  })
  limit?: number = EMPLOYEE_CONSTANTS.DEFAULT_LIMIT;

  @IsOptional()
  @IsEnum(Role, { message: EMPLOYEE_VALIDATION_MESSAGES.ROLE_INVALID })
  role?: Role;

  @IsOptional()
  @IsEnum(Gender, { message: EMPLOYEE_VALIDATION_MESSAGES.GENDER_INVALID })
  gender?: Gender;

  @IsOptional()
  @IsString({ message: EMPLOYEE_VALIDATION_MESSAGES.SEARCH_STRING })
  search?: string;
}
