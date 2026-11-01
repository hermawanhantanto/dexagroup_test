import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  ALLOWED_PHOTO_MIME_TYPES,
  MAX_PHOTO_FILE_SIZE,
  MIN_PHOTO_FILE_SIZE,
  type AllowedPhotoMimeType,
} from '../attendance.constants.js';

export class CreateUploadUrlDto {
  @IsIn(ALLOWED_PHOTO_MIME_TYPES, {
    message: 'MIME type must be image/jpeg, image/png, or image/webp',
  })
  mimeType: AllowedPhotoMimeType;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'File size must be an integer' })
  @Min(MIN_PHOTO_FILE_SIZE, { message: 'File size must be at least 1 byte' })
  @Max(MAX_PHOTO_FILE_SIZE, { message: 'File size cannot exceed 5MB' })
  fileSize?: number;
}
