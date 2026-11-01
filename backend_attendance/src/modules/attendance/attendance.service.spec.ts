import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { AttendanceService } from './attendance.service.js';
import { AttendanceStatus } from '../../generated/prisma/enums.js';

describe('AttendanceService', () => {
  let attendanceService: AttendanceService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      attendance: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn().mockImplementation((operations: Promise<any>[]) =>
        Promise.all(operations),
      ),
    };

    attendanceService = new AttendanceService(prismaMock);
  });

  describe('checkIn', () => {
    it('should throw BadRequestException if today is a weekend', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-11-01T10:00:00Z'));

      await expect(
        attendanceService.checkIn('user-1', {
          proofImageUrl: 'https://supabase.co/storage/photo.jpg',
        }),
      ).rejects.toThrow(BadRequestException);

      vi.useRealTimers();
    });

    it('should throw ConflictException if already checked in today', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-11-02T08:30:00Z'));

      prismaMock.attendance.findUnique.mockResolvedValue({
        id: 'existing-id',
        userId: 'user-1',
        attendanceDate: new Date('2026-11-02T00:00:00Z'),
        status: AttendanceStatus.PRESENT,
      });

      await expect(
        attendanceService.checkIn('user-1', {
          proofImageUrl: 'https://supabase.co/storage/photo.jpg',
        }),
      ).rejects.toThrow(ConflictException);

      vi.useRealTimers();
    });

    it('should successfully create an attendance record on a valid weekday', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-11-02T08:30:00Z'));

      prismaMock.attendance.findUnique.mockResolvedValue(null);

      const createdRecord = {
        id: 'att-123',
        userId: 'user-1',
        attendanceDate: new Date('2026-11-02T00:00:00Z'),
        clockInAt: new Date('2026-11-02T08:30:00Z'),
        proofImageUrl: 'https://supabase.co/storage/photo.jpg',
        notes: 'Working from home on auth',
        status: AttendanceStatus.PRESENT,
      };

      prismaMock.attendance.create.mockResolvedValue(createdRecord);

      const result = await attendanceService.checkIn('user-1', {
        proofImageUrl: 'https://supabase.co/storage/photo.jpg',
        notes: 'Working from home on auth',
      });

      expect(result).toEqual(createdRecord);
      expect(prismaMock.attendance.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          proofImageUrl: 'https://supabase.co/storage/photo.jpg',
          status: AttendanceStatus.PRESENT,
        }),
      });

      vi.useRealTimers();
    });
  });

  describe('getTodayStatus', () => {
    it('should return false flags when no record exists for today', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-11-02T08:30:00Z'));

      prismaMock.attendance.findUnique.mockResolvedValue(null);

      const result = await attendanceService.getTodayStatus('user-1');

      expect(result.hasCheckedIn).toBe(false);
      expect(result.hasClockedOut).toBe(false);
      expect(result.attendance).toBeNull();

      vi.useRealTimers();
    });

    it('should return hasCheckedIn: true and hasClockedOut: false when checked in but not clocked out', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-11-02T08:30:00Z'));

      const mockRecord = {
        id: 'att-1',
        userId: 'user-1',
        attendanceDate: new Date('2026-11-02T00:00:00Z'),
        clockInAt: new Date('2026-11-02T08:30:00Z'),
        clockOutAt: null,
        status: AttendanceStatus.PRESENT,
      };

      prismaMock.attendance.findUnique.mockResolvedValue(mockRecord);

      const result = await attendanceService.getTodayStatus('user-1');

      expect(result.hasCheckedIn).toBe(true);
      expect(result.hasClockedOut).toBe(false);
      expect(result.attendance).toEqual(mockRecord);

      vi.useRealTimers();
    });

    it('should return hasCheckedIn: true and hasClockedOut: true when clocked out', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-11-02T17:00:00Z'));

      const mockRecord = {
        id: 'att-1',
        userId: 'user-1',
        attendanceDate: new Date('2026-11-02T00:00:00Z'),
        clockInAt: new Date('2026-11-02T08:30:00Z'),
        clockOutAt: new Date('2026-11-02T17:00:00Z'),
        status: AttendanceStatus.PRESENT,
      };

      prismaMock.attendance.findUnique.mockResolvedValue(mockRecord);

      const result = await attendanceService.getTodayStatus('user-1');

      expect(result.hasCheckedIn).toBe(true);
      expect(result.hasClockedOut).toBe(true);
      expect(result.attendance).toEqual(mockRecord);

      vi.useRealTimers();
    });
  });

  describe('clockOut', () => {
    it('should throw BadRequestException if user has not checked in today', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-11-02T17:00:00Z'));

      prismaMock.attendance.findUnique.mockResolvedValue(null);

      await expect(
        attendanceService.clockOut('user-1', { notes: 'EOD report' }),
      ).rejects.toThrow(BadRequestException);

      vi.useRealTimers();
    });

    it('should throw ConflictException if user has already clocked out today', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-11-02T17:00:00Z'));

      prismaMock.attendance.findUnique.mockResolvedValue({
        id: 'att-1',
        userId: 'user-1',
        clockInAt: new Date('2026-11-02T08:30:00Z'),
        clockOutAt: new Date('2026-11-02T16:30:00Z'),
      });

      await expect(
        attendanceService.clockOut('user-1', { notes: 'Double clock-out' }),
      ).rejects.toThrow(ConflictException);

      vi.useRealTimers();
    });

    it('should update clockOutAt and notes when valid', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-11-02T17:00:00Z'));

      const initialRecord = {
        id: 'att-1',
        userId: 'user-1',
        clockInAt: new Date('2026-11-02T08:30:00Z'),
        clockOutAt: null,
        notes: 'Morning note',
      };

      prismaMock.attendance.findUnique.mockResolvedValue(initialRecord);

      const updatedRecord = {
        ...initialRecord,
        clockOutAt: new Date('2026-11-02T17:00:00Z'),
        notes: 'Updated EOD note',
      };

      prismaMock.attendance.update.mockResolvedValue(updatedRecord);

      const result = await attendanceService.clockOut('user-1', {
        notes: 'Updated EOD note',
      });

      expect(result).toEqual(updatedRecord);
      expect(prismaMock.attendance.update).toHaveBeenCalledWith({
        where: { id: 'att-1' },
        data: {
          clockOutAt: expect.any(Date),
          notes: 'Updated EOD note',
        },
      });

      vi.useRealTimers();
    });
  });

  describe('getMyHistory', () => {
    it('should throw BadRequestException if startDate is after endDate', async () => {
      await expect(
        attendanceService.getMyHistory('user-1', {
          startDate: '2026-11-10',
          endDate: '2026-11-05',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return paginated records and metadata using prisma transaction', async () => {
      const mockRecords = [
        {
          id: 'att-1',
          userId: 'user-1',
          attendanceDate: new Date('2026-11-02'),
          status: AttendanceStatus.PRESENT,
        },
      ];

      prismaMock.attendance.findMany.mockResolvedValue(mockRecords);
      prismaMock.attendance.count.mockResolvedValue(1);

      const result = await attendanceService.getMyHistory('user-1', {});

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(result.data).toEqual(mockRecords);
      expect(result.pagination).toEqual({
        totalRecords: 1,
        currentPage: 1,
        totalPages: 1,
        limit: 10,
        hasNextPage: false,
        hasPreviousPage: false,
      });

      expect(prismaMock.attendance.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { attendanceDate: 'desc' },
        skip: 0,
        take: 10,
      });
    });

    it('should apply status and date range filters when provided', async () => {
      prismaMock.attendance.findMany.mockResolvedValue([]);
      prismaMock.attendance.count.mockResolvedValue(0);

      const result = await attendanceService.getMyHistory('user-1', {
        page: 2,
        limit: 5,
        status: AttendanceStatus.PRESENT,
        startDate: '2026-11-01',
        endDate: '2026-11-15',
      });

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(result.pagination.currentPage).toBe(2);
      expect(result.pagination.limit).toBe(5);

      expect(prismaMock.attendance.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          status: AttendanceStatus.PRESENT,
          attendanceDate: {
            gte: new Date('2026-11-01'),
            lte: new Date('2026-11-15'),
          },
        },
        orderBy: { attendanceDate: 'desc' },
        skip: 5,
        take: 5,
      });
    });
  });
});
