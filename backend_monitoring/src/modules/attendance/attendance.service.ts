import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  ATTENDANCE_CONSTANTS,
  ATTENDANCE_ERROR_MESSAGES,
} from './attendance.constants.js';
import { GetAttendancesQueryDto } from './dto/get-attendances-query.dto.js';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllAttendances(queryDto: GetAttendancesQueryDto) {
    if (
      queryDto.startDate &&
      queryDto.endDate &&
      new Date(queryDto.startDate) > new Date(queryDto.endDate)
    ) {
      throw new BadRequestException(
        ATTENDANCE_ERROR_MESSAGES.INVALID_DATE_RANGE,
      );
    }

    const targetPageNumber = queryDto.page ?? ATTENDANCE_CONSTANTS.DEFAULT_PAGE;
    const recordsPerPageLimit =
      queryDto.limit ?? ATTENDANCE_CONSTANTS.DEFAULT_LIMIT;
    const skipOffset = (targetPageNumber - 1) * recordsPerPageLimit;

    const whereClause: Record<string, unknown> = {};

    if (queryDto.status) {
      whereClause.status = queryDto.status;
    }

    if (queryDto.startDate || queryDto.endDate) {
      const attendanceDateFilter: Record<string, Date> = {};
      if (queryDto.startDate) {
        attendanceDateFilter.gte = new Date(queryDto.startDate);
      }
      if (queryDto.endDate) {
        attendanceDateFilter.lte = new Date(queryDto.endDate);
      }
      whereClause.attendanceDate = attendanceDateFilter;
    }

    if (queryDto.search) {
      const trimmedSearchQuery = queryDto.search.trim();
      if (trimmedSearchQuery.length > 0) {
        whereClause.user = {
          OR: [
            { firstName: { contains: trimmedSearchQuery } },
            { lastName: { contains: trimmedSearchQuery } },
            { position: { contains: trimmedSearchQuery } },
            { department: { contains: trimmedSearchQuery } },
          ],
        };
      }
    }

    const [attendanceRecords, totalRecordCount] =
      await this.prisma.$transaction([
        this.prisma.attendance.findMany({
          where: whereClause,
          orderBy: { attendanceDate: 'desc' },
          skip: skipOffset,
          take: recordsPerPageLimit,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                position: true,
                department: true,
                role: true,
              },
            },
          },
        }),
        this.prisma.attendance.count({
          where: whereClause,
        }),
      ]);

    const calculatedTotalPages = Math.ceil(
      totalRecordCount / recordsPerPageLimit,
    );

    return {
      data: attendanceRecords,
      pagination: {
        totalRecords: totalRecordCount,
        currentPage: targetPageNumber,
        totalPages: calculatedTotalPages,
        recordsPerPage: recordsPerPageLimit,
        hasNextPage: targetPageNumber < calculatedTotalPages,
        hasPreviousPage: targetPageNumber > 1,
      },
    };
  }

  async getAttendanceById(attendanceId: string) {
    const existingAttendance = await this.prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            position: true,
            department: true,
            role: true,
          },
        },
      },
    });

    if (!existingAttendance) {
      throw new NotFoundException(
        ATTENDANCE_ERROR_MESSAGES.ATTENDANCE_NOT_FOUND,
      );
    }

    return existingAttendance;
  }
}
