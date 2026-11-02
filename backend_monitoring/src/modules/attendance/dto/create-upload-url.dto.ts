import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import {
  ALLOWED_PHOTO_MIME_TYPES,
  ATTENDANCE_VALIDATION_MESSAGES,
  MAX_PHOTO_FILE_SIZE,
  MIN_PHOTO_FILE_SIZE,
  type AllowedPhotoMimeType,
} from '../attendance.constants.js';

export class CreateUploadUrlDto {
  @IsIn(ALLOWED_PHOTO_MIME_TYPES, {
    message: ATTENDANCE_VALIDATION_MESSAGES.MIME_TYPE_INVALID,
  })
  mimeType: AllowedPhotoMimeType;

  @IsOptional()
  @IsUUID('all', { message: ATTENDANCE_VALIDATION_MESSAGES.USER_ID_INVALID })
  userId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: ATTENDANCE_VALIDATION_MESSAGES.FILE_SIZE_INT })
  @Min(MIN_PHOTO_FILE_SIZE, {
    message: ATTENDANCE_VALIDATION_MESSAGES.FILE_SIZE_MIN,
  })
  @Max(MAX_PHOTO_FILE_SIZE, {
    message: ATTENDANCE_VALIDATION_MESSAGES.FILE_SIZE_MAX,
  })
  fileSize?: number;
}
