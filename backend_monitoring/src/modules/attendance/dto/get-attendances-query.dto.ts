import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { AttendanceStatus } from '../../../generated/prisma/enums.js';
import {
  ATTENDANCE_CONSTANTS,
  ATTENDANCE_VALIDATION_MESSAGES,
} from '../attendance.constants.js';

export class GetAttendancesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: ATTENDANCE_VALIDATION_MESSAGES.PAGE_INT })
  @Min(ATTENDANCE_CONSTANTS.MIN_PAGE, {
    message: ATTENDANCE_VALIDATION_MESSAGES.PAGE_MIN,
  })
  page?: number = ATTENDANCE_CONSTANTS.DEFAULT_PAGE;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: ATTENDANCE_VALIDATION_MESSAGES.LIMIT_INT })
  @Min(ATTENDANCE_CONSTANTS.MIN_LIMIT, {
    message: ATTENDANCE_VALIDATION_MESSAGES.LIMIT_MIN,
  })
  @Max(ATTENDANCE_CONSTANTS.MAX_LIMIT, {
    message: ATTENDANCE_VALIDATION_MESSAGES.LIMIT_MAX,
  })
  limit?: number = ATTENDANCE_CONSTANTS.DEFAULT_LIMIT;

  @IsOptional()
  @IsDateString(
    {},
    { message: ATTENDANCE_VALIDATION_MESSAGES.START_DATE_INVALID },
  )
  startDate?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: ATTENDANCE_VALIDATION_MESSAGES.END_DATE_INVALID },
  )
  endDate?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus, {
    message: ATTENDANCE_VALIDATION_MESSAGES.STATUS_INVALID,
  })
  status?: AttendanceStatus;

  @IsOptional()
  @IsString({ message: ATTENDANCE_VALIDATION_MESSAGES.SEARCH_STRING })
  search?: string;
}
