export const ATTENDANCE_CONSTANTS = {
  ROUTE: 'attendances',
  DEFAULT_PAGE: 1,
  MIN_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
  GET_ALL_ATTENDANCES_SUCCESS_MESSAGE: 'Attendances retrieved successfully',
  GET_ATTENDANCE_SUCCESS_MESSAGE: 'Attendance details retrieved successfully',
} as const;

export const ATTENDANCE_ERROR_MESSAGES = {
  INVALID_DATE_RANGE: 'Start date cannot be after end date',
  ATTENDANCE_NOT_FOUND: 'Attendance record not found',
} as const;

export const ATTENDANCE_VALIDATION_MESSAGES = {
  START_DATE_INVALID: 'Start date must be a valid ISO-8601 date string',
  END_DATE_INVALID: 'End date must be a valid ISO-8601 date string',
  STATUS_INVALID: 'Status must be one of: PRESENT, SICK, LEAVE, ABSENT',
  SEARCH_STRING: 'Search query must be a string',
  PAGE_INT: 'Page must be an integer',
  PAGE_MIN: 'Page must be at least 1',
  LIMIT_INT: 'Limit must be an integer',
  LIMIT_MIN: 'Limit must be at least 1',
  LIMIT_MAX: 'Limit cannot exceed 100',
} as const;
