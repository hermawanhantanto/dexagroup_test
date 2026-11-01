import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AttendanceStatus } from '../../generated/prisma/enums.js';
import { CheckInDto } from './dto/check-in.dto.js';
import { ClockOutDto } from './dto/clock-out.dto.js';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async checkIn(userId: string, checkInDto: CheckInDto) {
    const currentCalendarDate = new Date();
    const dayOfWeek = currentCalendarDate.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      throw new BadRequestException('Attendance cannot be submitted on weekends');
    }

    const normalizedTodayDate = new Date(
      Date.UTC(
        currentCalendarDate.getUTCFullYear(),
        currentCalendarDate.getUTCMonth(),
        currentCalendarDate.getUTCDate(),
      ),
    );

    const existingAttendanceRecord = await this.prisma.attendance.findUnique({
      where: {
        unique_user_attendance_per_date: {
          userId,
          attendanceDate: normalizedTodayDate,
        },
      },
    });

    if (existingAttendanceRecord) {
      throw new ConflictException('You have already checked in for today');
    }

    return await this.prisma.attendance.create({
      data: {
        userId,
        attendanceDate: normalizedTodayDate,
        clockInAt: new Date(),
        proofImageUrl: checkInDto.proofImageUrl,
        notes: checkInDto.notes?.trim() || null,
        status: AttendanceStatus.PRESENT,
      },
    });
  }

  async getTodayStatus(userId: string) {
    const currentCalendarDate = new Date();
    const normalizedTodayDate = new Date(
      Date.UTC(
        currentCalendarDate.getUTCFullYear(),
        currentCalendarDate.getUTCMonth(),
        currentCalendarDate.getUTCDate(),
      ),
    );

    const todayAttendanceRecord = await this.prisma.attendance.findUnique({
      where: {
        unique_user_attendance_per_date: {
          userId,
          attendanceDate: normalizedTodayDate,
        },
      },
    });

    return {
      hasCheckedIn: Boolean(todayAttendanceRecord),
      hasClockedOut: Boolean(todayAttendanceRecord?.clockOutAt),
      attendance: todayAttendanceRecord,
    };
  }

  async clockOut(userId: string, clockOutDto: ClockOutDto) {
    const currentCalendarDate = new Date();
    const normalizedTodayDate = new Date(
      Date.UTC(
        currentCalendarDate.getUTCFullYear(),
        currentCalendarDate.getUTCMonth(),
        currentCalendarDate.getUTCDate(),
      ),
    );

    const existingAttendanceRecord = await this.prisma.attendance.findUnique({
      where: {
        unique_user_attendance_per_date: {
          userId,
          attendanceDate: normalizedTodayDate,
        },
      },
    });

    if (!existingAttendanceRecord) {
      throw new BadRequestException('Cannot clock out without clocking in first');
    }

    if (existingAttendanceRecord.clockOutAt) {
      throw new ConflictException('You have already clocked out for today');
    }

    const updatedNotes =
      clockOutDto.notes !== undefined
        ? clockOutDto.notes?.trim() || null
        : existingAttendanceRecord.notes;

    return await this.prisma.attendance.update({
      where: { id: existingAttendanceRecord.id },
      data: {
        clockOutAt: new Date(),
        notes: updatedNotes,
      },
    });
  }
}
