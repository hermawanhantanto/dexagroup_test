import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { HolidaysService } from './holidays.service.js';
import { CreateHolidayDto } from './dto/create-holiday.dto.js';

describe('HolidaysService', () => {
  let holidaysService: HolidaysService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      holiday: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
    };

    holidaysService = new HolidaysService(prismaMock);
  });

  describe('createHoliday', () => {
    it('should throw ConflictException if a holiday for the given date already exists', async () => {
      prismaMock.holiday.findUnique.mockResolvedValue({
        id: 'existing-holiday-id',
        holidayDate: new Date('2026-12-25'),
        name: 'Christmas Day',
      });

      const payload: CreateHolidayDto = {
        holidayDate: '2026-12-25',
        name: 'Christmas',
      };

      await expect(holidaysService.createHoliday(payload)).rejects.toThrow(
        ConflictException,
      );

      expect(prismaMock.holiday.findUnique).toHaveBeenCalled();
      expect(prismaMock.holiday.create).not.toHaveBeenCalled();
    });

    it('should create holiday with normalized UTC date and trimmed fields', async () => {
      prismaMock.holiday.findUnique.mockResolvedValue(null);

      const mockCreatedHoliday = {
        id: 'new-holiday-uuid',
        holidayDate: new Date(Date.UTC(2026, 11, 25)),
        name: 'Christmas Day',
        description: 'National public holiday',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.holiday.create.mockResolvedValue(mockCreatedHoliday);

      const payload: CreateHolidayDto = {
        holidayDate: '2026-12-25',
        name: '  Christmas Day  ',
        description: '  National public holiday  ',
      };

      const result = await holidaysService.createHoliday(payload);

      expect(prismaMock.holiday.findUnique).toHaveBeenCalledWith({
        where: {
          holidayDate: new Date(Date.UTC(2026, 11, 25)),
        },
      });

      expect(prismaMock.holiday.create).toHaveBeenCalledWith({
        data: {
          holidayDate: new Date(Date.UTC(2026, 11, 25)),
          name: 'Christmas Day',
          description: 'National public holiday',
        },
      });

      expect(result).toEqual(mockCreatedHoliday);
    });

    it('should set description to null when omitted', async () => {
      prismaMock.holiday.findUnique.mockResolvedValue(null);

      const mockCreatedHoliday = {
        id: 'new-holiday-uuid',
        holidayDate: new Date(Date.UTC(2026, 0, 1)),
        name: 'New Year',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.holiday.create.mockResolvedValue(mockCreatedHoliday);

      const payload: CreateHolidayDto = {
        holidayDate: '2026-01-01',
        name: 'New Year',
      };

      const result = await holidaysService.createHoliday(payload);

      expect(prismaMock.holiday.create).toHaveBeenCalledWith({
        data: {
          holidayDate: new Date(Date.UTC(2026, 0, 1)),
          name: 'New Year',
          description: null,
        },
      });

      expect(result).toEqual(mockCreatedHoliday);
    });
  });

  describe('getAllHolidays', () => {
    it('should return list of holidays ordered by holidayDate asc', async () => {
      const mockHolidays = [
        {
          id: 'holiday-1',
          holidayDate: new Date('2026-01-01'),
          name: 'New Year',
        },
        {
          id: 'holiday-2',
          holidayDate: new Date('2026-12-25'),
          name: 'Christmas',
        },
      ];

      prismaMock.holiday.findMany.mockResolvedValue(mockHolidays);

      const result = await holidaysService.getAllHolidays();

      expect(prismaMock.holiday.findMany).toHaveBeenCalledWith({
        orderBy: { holidayDate: 'asc' },
      });
      expect(result).toEqual(mockHolidays);
    });
  });

  describe('deleteHoliday', () => {
    it('should throw NotFoundException when holiday does not exist', async () => {
      prismaMock.holiday.findUnique.mockResolvedValue(null);

      await expect(
        holidaysService.deleteHoliday('non-existent-uuid'),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.holiday.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-uuid' },
      });
      expect(prismaMock.holiday.delete).not.toHaveBeenCalled();
    });

    it('should delete holiday and return deleted id when holiday exists', async () => {
      const mockExistingHoliday = {
        id: 'holiday-1',
        name: 'New Year',
      };

      prismaMock.holiday.findUnique.mockResolvedValue(mockExistingHoliday);
      prismaMock.holiday.delete.mockResolvedValue(mockExistingHoliday);

      const result = await holidaysService.deleteHoliday('holiday-1');

      expect(prismaMock.holiday.findUnique).toHaveBeenCalledWith({
        where: { id: 'holiday-1' },
      });
      expect(prismaMock.holiday.delete).toHaveBeenCalledWith({
        where: { id: 'holiday-1' },
      });
      expect(result).toEqual({ id: 'holiday-1' });
    });
  });
});
