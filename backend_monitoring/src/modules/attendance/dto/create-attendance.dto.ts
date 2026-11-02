import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { AttendanceStatus } from '../../../generated/prisma/enums.js';
import { ATTENDANCE_VALIDATION_MESSAGES } from '../attendance.constants.js';

export class CreateAttendanceDto {
  @IsUUID('all', { message: ATTENDANCE_VALIDATION_MESSAGES.USER_ID_INVALID })
  @IsNotEmpty({ message: ATTENDANCE_VALIDATION_MESSAGES.USER_ID_REQUIRED })
  userId: string;

  @IsDateString(
    {},
    { message: ATTENDANCE_VALIDATION_MESSAGES.ATTENDANCE_DATE_INVALID },
  )
  @IsNotEmpty({
    message: ATTENDANCE_VALIDATION_MESSAGES.ATTENDANCE_DATE_REQUIRED,
  })
  attendanceDate: string;

  @IsIn([AttendanceStatus.SICK, AttendanceStatus.LEAVE], {
    message: ATTENDANCE_VALIDATION_MESSAGES.STATUS_SICK_OR_LEAVE,
  })
  @IsNotEmpty({ message: ATTENDANCE_VALIDATION_MESSAGES.STATUS_REQUIRED })
  status: typeof AttendanceStatus.SICK | typeof AttendanceStatus.LEAVE;

  @IsOptional()
  @IsString({ message: ATTENDANCE_VALIDATION_MESSAGES.NOTES_STRING })
  notes?: string;

  @IsOptional()
  @IsString({ message: ATTENDANCE_VALIDATION_MESSAGES.PROOF_IMAGE_URL_STRING })
  proofImageUrl?: string;
}
