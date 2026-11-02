import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HolidaysController } from './holidays.controller.js';
import { HOLIDAY_CONSTANTS } from './holiday.constants.js';

describe('HolidaysController', () => {
  let holidaysController: HolidaysController;
  let holidaysServiceMock: any;

  beforeEach(() => {
    holidaysServiceMock = {
      createHoliday: vi.fn(),
      getAllHolidays: vi.fn(),
      deleteHoliday: vi.fn(),
    };

    holidaysController = new HolidaysController(holidaysServiceMock);
  });

  describe('createHoliday', () => {
    it('should call holidaysService.createHoliday and return success payload', async () => {
      const mockResult = {
        id: 'holiday-1',
        holidayDate: new Date('2026-12-25'),
        name: 'Christmas',
      };
      holidaysServiceMock.createHoliday.mockResolvedValue(mockResult);

      const payload = {
        holidayDate: '2026-12-25',
        name: 'Christmas',
      };

      const response = await holidaysController.createHoliday(payload);

      expect(holidaysServiceMock.createHoliday).toHaveBeenCalledWith(payload);
      expect(response).toEqual({
        message: HOLIDAY_CONSTANTS.CREATE_SUCCESS_MESSAGE,
        data: mockResult,
      });
    });
  });

  describe('getAllHolidays', () => {
    it('should call holidaysService.getAllHolidays and return all holidays payload', async () => {
      const mockResult = [
        {
          id: 'holiday-1',
          holidayDate: new Date('2026-01-01'),
          name: 'New Year',
        },
      ];
      holidaysServiceMock.getAllHolidays.mockResolvedValue(mockResult);

      const response = await holidaysController.getAllHolidays();

      expect(holidaysServiceMock.getAllHolidays).toHaveBeenCalled();
      expect(response).toEqual({
        message: HOLIDAY_CONSTANTS.GET_ALL_SUCCESS_MESSAGE,
        data: mockResult,
      });
    });
  });

  describe('deleteHoliday', () => {
    it('should call holidaysService.deleteHoliday and return delete payload', async () => {
      const mockResult = { id: 'holiday-1' };
      holidaysServiceMock.deleteHoliday.mockResolvedValue(mockResult);

      const response = await holidaysController.deleteHoliday('holiday-1');

      expect(holidaysServiceMock.deleteHoliday).toHaveBeenCalledWith(
        'holiday-1',
      );
      expect(response).toEqual({
        message: HOLIDAY_CONSTANTS.DELETE_SUCCESS_MESSAGE,
        data: mockResult,
      });
    });
  });
});
