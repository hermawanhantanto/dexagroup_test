export const DEFAULT_ATTENDANCE_PAGE = 1;
export const DEFAULT_ATTENDANCE_LIMIT = 10;
export const MIN_ATTENDANCE_PAGE = 1;
export const MIN_ATTENDANCE_LIMIT = 1;
export const MAX_ATTENDANCE_LIMIT = 50;

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
