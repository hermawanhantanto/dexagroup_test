import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, type AuthenticatedUser } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { AttendanceService } from './attendance.service.js';
import { CheckInDto } from './dto/check-in.dto.js';
import { ClockOutDto } from './dto/clock-out.dto.js';

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

  @Get('today')
  @HttpCode(HttpStatus.OK)
  async getTodayStatus(@CurrentUser() authenticatedUser: AuthenticatedUser) {
    return this.attendanceService.getTodayStatus(authenticatedUser.sub);
  }

  @Post('clock-out')
  @HttpCode(HttpStatus.OK)
  async clockOut(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Body() clockOutDto: ClockOutDto,
  ) {
    const updatedAttendance = await this.attendanceService.clockOut(
      authenticatedUser.sub,
      clockOutDto,
    );

    return {
      message: 'Attendance clocked out successfully',
      attendance: updatedAttendance,
    };
  }
}
