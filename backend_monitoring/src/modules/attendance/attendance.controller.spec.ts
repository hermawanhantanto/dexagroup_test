import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AttendanceController } from './attendance.controller.js';
import { ATTENDANCE_CONSTANTS } from './attendance.constants.js';

describe('AttendanceController', () => {
  let attendanceController: AttendanceController;
  let attendanceServiceMock: any;

  beforeEach(() => {
    attendanceServiceMock = {
      getAllAttendances: vi.fn(),
      getAttendanceById: vi.fn(),
    };
    attendanceController = new AttendanceController(attendanceServiceMock);
  });

  describe('getAllAttendances', () => {
    it('should call attendanceService.getAllAttendances and return response payload', async () => {
      const mockResult = {
        data: [
          {
            id: 'attendance-1',
            status: 'PRESENT',
          },
        ],
        pagination: {
          totalRecords: 1,
          currentPage: 1,
          totalPages: 1,
          recordsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      attendanceServiceMock.getAllAttendances.mockResolvedValue(mockResult);

      const queryDto = { page: 1, limit: 10, search: 'Alice' };
      const response = await attendanceController.getAllAttendances(queryDto);

      expect(attendanceServiceMock.getAllAttendances).toHaveBeenCalledWith(
        queryDto,
      );
      expect(response).toEqual({
        message: ATTENDANCE_CONSTANTS.GET_ALL_ATTENDANCES_SUCCESS_MESSAGE,
        data: mockResult.data,
        pagination: mockResult.pagination,
      });
    });
  });

  describe('getAttendanceById', () => {
    it('should call attendanceService.getAttendanceById and return attendance response payload', async () => {
      const mockResult = {
        id: 'attendance-1',
        status: 'PRESENT',
        clockInAt: '2026-11-02T08:00:00.000Z',
      };

      attendanceServiceMock.getAttendanceById.mockResolvedValue(mockResult);

      const response =
        await attendanceController.getAttendanceById('attendance-1');

      expect(attendanceServiceMock.getAttendanceById).toHaveBeenCalledWith(
        'attendance-1',
      );
      expect(response).toEqual({
        message: ATTENDANCE_CONSTANTS.GET_ATTENDANCE_SUCCESS_MESSAGE,
        data: mockResult,
      });
    });
  });
});
