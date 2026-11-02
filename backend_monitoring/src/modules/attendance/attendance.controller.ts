import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  JwtAuthGuard,
  type AuthenticatedUser,
} from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { ATTENDANCE_CONSTANTS } from './attendance.constants.js';
import { AttendanceService } from './attendance.service.js';
import { GetAttendancesQueryDto } from './dto/get-attendances-query.dto.js';
import { CreateAttendanceDto } from './dto/create-attendance.dto.js';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto.js';

@UseGuards(JwtAuthGuard)
@Controller([ATTENDANCE_CONSTANTS.ROUTE, 'attendance'])
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('upload-url')
  @HttpCode(HttpStatus.OK)
  async createUploadUrl(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Body() createUploadUrlDto: CreateUploadUrlDto,
  ) {
    const uploadCredentials = await this.attendanceService.createUploadUrl(
      authenticatedUser.sub,
      createUploadUrlDto,
    );

    return {
      message: ATTENDANCE_CONSTANTS.CREATE_UPLOAD_URL_SUCCESS_MESSAGE,
      data: uploadCredentials,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAttendance(@Body() createAttendanceDto: CreateAttendanceDto) {
    const createdAttendance =
      await this.attendanceService.createAttendance(createAttendanceDto);

    return {
      message: ATTENDANCE_CONSTANTS.CREATE_ATTENDANCE_SUCCESS_MESSAGE,
      data: createdAttendance,
    };
  }

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

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getAttendanceById(
    @Param('id', new ParseUUIDPipe()) attendanceId: string,
  ) {
    const attendance =
      await this.attendanceService.getAttendanceById(attendanceId);

    return {
      message: ATTENDANCE_CONSTANTS.GET_ATTENDANCE_SUCCESS_MESSAGE,
      data: attendance,
    };
  }
}

