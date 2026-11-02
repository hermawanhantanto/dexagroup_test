export const ATTENDANCE_CONSTANTS = {
  ROUTE: 'attendances',
  DEFAULT_PAGE: 1,
  MIN_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
  GET_ALL_ATTENDANCES_SUCCESS_MESSAGE: 'Attendances retrieved successfully',
  GET_ATTENDANCE_SUCCESS_MESSAGE: 'Attendance details retrieved successfully',
  CREATE_ATTENDANCE_SUCCESS_MESSAGE: 'Attendance recorded successfully',
  CREATE_UPLOAD_URL_SUCCESS_MESSAGE: 'Upload URL generated successfully',
} as const;

export const ALLOWED_PHOTO_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type AllowedPhotoMimeType = (typeof ALLOWED_PHOTO_MIME_TYPES)[number];

export const MIME_TO_EXTENSION_MAP: Record<AllowedPhotoMimeType, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export const MAX_PHOTO_FILE_SIZE = 5242880;
export const MIN_PHOTO_FILE_SIZE = 1;
export const DEFAULT_UPLOAD_URL_EXPIRATION_SECONDS = 120;

export const ATTENDANCE_ERROR_MESSAGES = {
  INVALID_DATE_RANGE: 'Start date cannot be after end date',
  ATTENDANCE_NOT_FOUND: 'Attendance record not found',
  ATTENDANCE_ALREADY_EXISTS:
    'Attendance record for this employee and date already exists',
  EMPLOYEE_NOT_FOUND: 'Employee not found',
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
  USER_ID_REQUIRED: 'User ID is required',
  USER_ID_INVALID: 'User ID must be a valid UUID',
  ATTENDANCE_DATE_REQUIRED: 'Attendance date is required',
  ATTENDANCE_DATE_INVALID: 'Attendance date must be a valid ISO-8601 date string',
  STATUS_REQUIRED: 'Status is required',
  STATUS_SICK_OR_LEAVE: 'Status must be either SICK or LEAVE',
  NOTES_STRING: 'Notes must be a string',
  PROOF_IMAGE_URL_STRING: 'Proof image URL must be a string',
  MIME_TYPE_INVALID: 'MIME type must be image/jpeg, image/png, or image/webp',
  FILE_SIZE_INT: 'File size must be an integer',
  FILE_SIZE_MIN: 'File size must be at least 1 byte',
  FILE_SIZE_MAX: 'File size cannot exceed 5MB',
} as const;
