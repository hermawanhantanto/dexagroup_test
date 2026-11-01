import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AttendanceStatus } from '../../generated/prisma/enums.js';
import { CheckInDto } from './dto/check-in.dto.js';
import { ClockOutDto } from './dto/clock-out.dto.js';
import { AttendanceHistoryQueryDto } from './dto/attendance-history-query.dto.js';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto.js';
import { StorageService } from '../../storage/storage.service.js';
import {
  DEFAULT_ATTENDANCE_LIMIT,
  DEFAULT_ATTENDANCE_PAGE,
  DEFAULT_UPLOAD_URL_EXPIRATION_SECONDS,
  MIME_TO_EXTENSION_MAP,
} from './attendance.constants.js';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async createUploadUrl(userId: string, createUploadUrlDto: CreateUploadUrlDto) {
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

    const fileExtension = MIME_TO_EXTENSION_MAP[createUploadUrlDto.mimeType];
    const formattedDateString = normalizedTodayDate.toISOString().slice(0, 10);
    const uniqueFileIdentifier = randomUUID();
    const storageFilePath = `proofs/${userId}/${formattedDateString}_${uniqueFileIdentifier}${fileExtension}`;

    const uploadCredentials =
      await this.storageService.generateSignedUploadUrl(storageFilePath);

    return {
      ...uploadCredentials,
      expiresIn: DEFAULT_UPLOAD_URL_EXPIRATION_SECONDS,
    };
  }

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

  async getMyHistory(userId: string, queryDto: AttendanceHistoryQueryDto) {
    const targetPageNumber = queryDto.page ?? DEFAULT_ATTENDANCE_PAGE;
    const recordsPerPageLimit = queryDto.limit ?? DEFAULT_ATTENDANCE_LIMIT;
    const skipOffset = (targetPageNumber - 1) * recordsPerPageLimit;

    if (
      queryDto.startDate &&
      queryDto.endDate &&
      new Date(queryDto.startDate) > new Date(queryDto.endDate)
    ) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    const attendanceFilterCondition: {
      userId: string;
      status?: AttendanceStatus;
      attendanceDate?: {
        gte?: Date;
        lte?: Date;
      };
    } = {
      userId,
    };

    if (queryDto.status) {
      attendanceFilterCondition.status = queryDto.status;
    }

    if (queryDto.startDate || queryDto.endDate) {
      attendanceFilterCondition.attendanceDate = {};
      if (queryDto.startDate) {
        attendanceFilterCondition.attendanceDate.gte = new Date(queryDto.startDate);
      }
      if (queryDto.endDate) {
        attendanceFilterCondition.attendanceDate.lte = new Date(queryDto.endDate);
      }
    }

    const [attendanceRecords, totalRecordCount] = await this.prisma.$transaction([
      this.prisma.attendance.findMany({
        where: attendanceFilterCondition,
        orderBy: { attendanceDate: 'desc' },
        skip: skipOffset,
        take: recordsPerPageLimit,
      }),
      this.prisma.attendance.count({
        where: attendanceFilterCondition,
      }),
    ]);

    const calculatedTotalPages = Math.ceil(totalRecordCount / recordsPerPageLimit);

    return {
      data: attendanceRecords,
      pagination: {
        totalRecords: totalRecordCount,
        currentPage: targetPageNumber,
        totalPages: calculatedTotalPages,
        limit: recordsPerPageLimit,
        hasNextPage: targetPageNumber < calculatedTotalPages,
        hasPreviousPage: targetPageNumber > 1,
      },
    };
  }
}
