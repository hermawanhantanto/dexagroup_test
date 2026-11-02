import { Role } from '../../generated/prisma/enums.js';

export const EMPLOYEE_CONSTANTS = {
  ROUTE: 'employees',
  DEFAULT_ROLE: Role.EMPLOYEE,
  CREATE_SUCCESS_MESSAGE: 'Employee created successfully',
  UPDATE_SUCCESS_MESSAGE: 'Employee updated successfully',
  GET_EMPLOYEE_SUCCESS_MESSAGE: 'Employee retrieved successfully',
  GET_ALL_EMPLOYEES_SUCCESS_MESSAGE: 'Employees retrieved successfully',
  DEFAULT_PAGE: 1,
  MIN_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
} as const;

export const EMPLOYEE_ERROR_MESSAGES = {
  EMAIL_ALREADY_EXISTS: 'An employee with this email already exists',
  EMPLOYEE_NOT_FOUND: 'Employee not found',
} as const;

export const EMPLOYEE_VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Must be a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_STRING: 'Password must be a string',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters long',
  FIRST_NAME_REQUIRED: 'First name is required',
  FIRST_NAME_STRING: 'First name must be a string',
  LAST_NAME_STRING: 'Last name must be a string',
  POSITION_STRING: 'Position must be a string',
  DEPARTMENT_STRING: 'Department must be a string',
  DATE_OF_BIRTH_INVALID: 'Date of birth must be a valid ISO 8601 date string',
  GENDER_INVALID: 'Gender must be either MALE or FEMALE',
  ROLE_INVALID: 'Role must be either EMPLOYEE or HR_ADMIN',
  SALARY_NUMBER: 'Salary must be a number',
  SALARY_MIN: 'Salary must be greater than or equal to 0',
  JOIN_DATE_INVALID: 'Join date must be a valid ISO 8601 date string',
  PAGE_INT: 'Page must be an integer',
  PAGE_MIN: 'Page must be at least 1',
  LIMIT_INT: 'Limit must be an integer',
  LIMIT_MIN: 'Limit must be at least 1',
  LIMIT_MAX: 'Limit cannot exceed 100',
  SEARCH_STRING: 'Search query must be a string',
} as const;

export const EMPLOYEE_VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  SALARY_MIN: 0,
  SALARY_MAX_DECIMAL_PLACES: 2,
} as const;
