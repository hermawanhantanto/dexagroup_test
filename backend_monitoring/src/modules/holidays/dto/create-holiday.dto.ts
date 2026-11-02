import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { HOLIDAY_VALIDATION_MESSAGES } from '../holiday.constants.js';

export class CreateHolidayDto {
  @IsDateString(
    {},
    { message: HOLIDAY_VALIDATION_MESSAGES.HOLIDAY_DATE_INVALID },
  )
  @IsNotEmpty({ message: HOLIDAY_VALIDATION_MESSAGES.HOLIDAY_DATE_REQUIRED })
  holidayDate: string;

  @IsString({ message: HOLIDAY_VALIDATION_MESSAGES.NAME_STRING })
  @IsNotEmpty({ message: HOLIDAY_VALIDATION_MESSAGES.NAME_REQUIRED })
  name: string;

  @IsOptional()
  @IsString({ message: HOLIDAY_VALIDATION_MESSAGES.DESCRIPTION_STRING })
  description?: string;
}
