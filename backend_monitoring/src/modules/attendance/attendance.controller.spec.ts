import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AttendanceController } from './attendance.controller.js';
import { ATTENDANCE_CONSTANTS } from './attendance.constants.js';

describe('AttendanceController', () => {
  let attendanceController: AttendanceController;
  let attendanceServiceMock: any;

  beforeEach(() => {
    attendanceServiceMock = {
      getAllAttendances: vi.fn(),
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
});
