import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AttendanceService } from './attendance.service.js';
import { AttendanceStatus } from '../../generated/prisma/enums.js';

describe('AttendanceService', () => {
  let attendanceService: AttendanceService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      attendance: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
      },
      $transaction: vi.fn((operations) => Promise.all(operations)),
    };

    attendanceService = new AttendanceService(prismaMock);
  });

  describe('getAllAttendances', () => {
    it('should throw BadRequestException when startDate is after endDate', async () => {
      await expect(
        attendanceService.getAllAttendances({
          startDate: '2026-11-10',
          endDate: '2026-11-01',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(prismaMock.attendance.findMany).not.toHaveBeenCalled();
    });

    it('should return paginated attendances with default pagination and sorting', async () => {
      const mockAttendances = [
        {
          id: 'attendance-1',
          userId: 'user-1',
          attendanceDate: new Date('2026-11-02'),
          status: AttendanceStatus.PRESENT,
          user: {
            id: 'user-1',
            email: 'alice@example.com',
            firstName: 'Alice',
          },
        },
      ];

      prismaMock.attendance.findMany.mockResolvedValue(mockAttendances);
      prismaMock.attendance.count.mockResolvedValue(1);

      const result = await attendanceService.getAllAttendances({});

      expect(prismaMock.attendance.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { attendanceDate: 'desc' },
        skip: 0,
        take: 10,
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

      expect(result).toEqual({
        data: mockAttendances,
        pagination: {
          totalRecords: 1,
          currentPage: 1,
          totalPages: 1,
          recordsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });

    it('should filter by attendance status when status is provided', async () => {
      prismaMock.attendance.findMany.mockResolvedValue([]);
      prismaMock.attendance.count.mockResolvedValue(0);

      await attendanceService.getAllAttendances({
        status: AttendanceStatus.SICK,
      });

      expect(prismaMock.attendance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: AttendanceStatus.SICK },
        }),
      );
    });

    it('should filter by date range when startDate and endDate are provided', async () => {
      prismaMock.attendance.findMany.mockResolvedValue([]);
      prismaMock.attendance.count.mockResolvedValue(0);

      await attendanceService.getAllAttendances({
        startDate: '2026-11-01',
        endDate: '2026-11-30',
      });

      expect(prismaMock.attendance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            attendanceDate: {
              gte: new Date('2026-11-01'),
              lte: new Date('2026-11-30'),
            },
          },
        }),
      );
    });

    it('should filter by startDate only when endDate is not provided', async () => {
      prismaMock.attendance.findMany.mockResolvedValue([]);
      prismaMock.attendance.count.mockResolvedValue(0);

      await attendanceService.getAllAttendances({
        startDate: '2026-11-01',
      });

      expect(prismaMock.attendance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            attendanceDate: {
              gte: new Date('2026-11-01'),
            },
          },
        }),
      );
    });

    it('should search across employee firstName, lastName, position, and department', async () => {
      prismaMock.attendance.findMany.mockResolvedValue([]);
      prismaMock.attendance.count.mockResolvedValue(0);

      await attendanceService.getAllAttendances({
        search: '  Engineering ',
      });

      expect(prismaMock.attendance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            user: {
              OR: [
                { firstName: { contains: 'Engineering' } },
                { lastName: { contains: 'Engineering' } },
                { position: { contains: 'Engineering' } },
                { department: { contains: 'Engineering' } },
              ],
            },
          },
        }),
      );
    });

    it('should ignore empty search query and not populate user OR condition', async () => {
      prismaMock.attendance.findMany.mockResolvedValue([]);
      prismaMock.attendance.count.mockResolvedValue(0);

      await attendanceService.getAllAttendances({
        search: '   ',
      });

      expect(prismaMock.attendance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });

    it('should correctly calculate pagination flags and offsets for custom page and limit', async () => {
      prismaMock.attendance.findMany.mockResolvedValue([]);
      prismaMock.attendance.count.mockResolvedValue(25);

      const result = await attendanceService.getAllAttendances({
        page: 2,
        limit: 10,
      });

      expect(prismaMock.attendance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );

      expect(result.pagination).toEqual({
        totalRecords: 25,
        currentPage: 2,
        totalPages: 3,
        recordsPerPage: 10,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });
  });

  describe('getAttendanceById', () => {
    it('should throw NotFoundException when attendance record is not found', async () => {
      prismaMock.attendance.findUnique.mockResolvedValue(null);

      await expect(
        attendanceService.getAttendanceById('nonexistent-uuid'),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.attendance.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent-uuid' },
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
    });

    it('should return attendance details with user information when found', async () => {
      const mockAttendance = {
        id: 'attendance-123',
        userId: 'user-123',
        attendanceDate: new Date('2026-11-02'),
        clockInAt: new Date('2026-11-02T08:00:00.000Z'),
        clockOutAt: new Date('2026-11-02T17:00:00.000Z'),
        proofImageUrl: 'https://storage.example.com/proofs/123.jpg',
        notes: 'Working from home',
        status: AttendanceStatus.PRESENT,
        user: {
          id: 'user-123',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          position: 'Software Engineer',
          department: 'Engineering',
          role: 'EMPLOYEE',
        },
      };

      prismaMock.attendance.findUnique.mockResolvedValue(mockAttendance);

      const result =
        await attendanceService.getAttendanceById('attendance-123');

      expect(prismaMock.attendance.findUnique).toHaveBeenCalledWith({
        where: { id: 'attendance-123' },
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

      expect(result).toEqual(mockAttendance);
    });
  });
});
