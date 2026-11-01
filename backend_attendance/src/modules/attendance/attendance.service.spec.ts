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
        create: vi.fn(),
      },
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
});
