import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { AttendanceStatus } from '../../../generated/prisma/enums.js';
import {
  DEFAULT_ATTENDANCE_LIMIT,
  DEFAULT_ATTENDANCE_PAGE,
  MAX_ATTENDANCE_LIMIT,
  MIN_ATTENDANCE_LIMIT,
  MIN_ATTENDANCE_PAGE,
} from '../attendance.constants.js';

export class AttendanceHistoryQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(MIN_ATTENDANCE_PAGE, { message: 'Page must be at least 1' })
  page?: number = DEFAULT_ATTENDANCE_PAGE;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(MIN_ATTENDANCE_LIMIT, { message: 'Limit must be at least 1' })
  @Max(MAX_ATTENDANCE_LIMIT, { message: 'Limit cannot exceed 50' })
  limit?: number = DEFAULT_ATTENDANCE_LIMIT;

  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid ISO-8601 date string' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid ISO-8601 date string' })
  endDate?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus, {
    message: 'Status must be one of: PRESENT, SICK, LEAVE, ABSENT',
  })
  status?: AttendanceStatus;
}
