import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { ATTENDANCE_CONSTANTS } from './attendance.constants.js';
import { AttendanceService } from './attendance.service.js';
import { GetAttendancesQueryDto } from './dto/get-attendances-query.dto.js';

@UseGuards(JwtAuthGuard)
@Controller([ATTENDANCE_CONSTANTS.ROUTE, 'attendance'])
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllAttendances(@Query() queryDto: GetAttendancesQueryDto) {
    const result = await this.attendanceService.getAllAttendances(queryDto);

    return {
      message: ATTENDANCE_CONSTANTS.GET_ALL_ATTENDANCES_SUCCESS_MESSAGE,
      data: result.data,
      pagination: result.pagination,
    };
  }
}
