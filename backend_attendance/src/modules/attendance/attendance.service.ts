import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AttendanceStatus } from '../../generated/prisma/enums.js';
import { CheckInDto } from './dto/check-in.dto.js';

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
}
