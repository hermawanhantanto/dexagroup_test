import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, type AuthenticatedUser } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { AttendanceService } from './attendance.service.js';
import { CheckInDto } from './dto/check-in.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @HttpCode(HttpStatus.CREATED)
  async checkIn(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Body() checkInDto: CheckInDto,
  ) {
    const createdAttendance = await this.attendanceService.checkIn(
      authenticatedUser.sub,
      checkInDto,
    );

    return {
      message: 'Attendance checked in successfully',
      attendance: createdAttendance,
    };
  }
}
