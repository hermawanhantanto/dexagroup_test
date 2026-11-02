export const HOLIDAY_CONSTANTS = {
  ROUTE: 'holidays',
  CREATE_SUCCESS_MESSAGE: 'Holiday created successfully',
  GET_ALL_SUCCESS_MESSAGE: 'Holidays retrieved successfully',
  DELETE_SUCCESS_MESSAGE: 'Holiday deleted successfully',
} as const;

export const HOLIDAY_ERROR_MESSAGES = {
  HOLIDAY_ALREADY_EXISTS: 'A holiday for this date already exists',
  HOLIDAY_NOT_FOUND: 'Holiday not found',
} as const;

export const HOLIDAY_VALIDATION_MESSAGES = {
  HOLIDAY_DATE_REQUIRED: 'Holiday date is required',
  HOLIDAY_DATE_INVALID: 'Holiday date must be a valid ISO-8601 date string',
  NAME_REQUIRED: 'Holiday name is required',
  NAME_STRING: 'Holiday name must be a string',
  DESCRIPTION_STRING: 'Description must be a string',
} as const;
