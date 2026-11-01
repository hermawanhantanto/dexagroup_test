import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AttendanceController } from './attendance.controller.js';

describe('AttendanceController', () => {
  let attendanceController: AttendanceController;
  let attendanceServiceMock: any;

  beforeEach(() => {
    attendanceServiceMock = {
      checkIn: vi.fn(),
    };

    attendanceController = new AttendanceController(attendanceServiceMock);
  });

  it('should call attendanceService.checkIn with user sub and dto', async () => {
    const mockUser = { sub: 'user-123', email: 'emp@dexa.com', role: 'EMPLOYEE' };
    const mockDto = { proofImageUrl: 'https://supabase.co/photo.jpg', notes: 'WFH' };
    const mockResponse = { id: 'att-1', ...mockDto };

    attendanceServiceMock.checkIn.mockResolvedValue(mockResponse);

    const result = await attendanceController.checkIn(mockUser, mockDto);

    expect(attendanceServiceMock.checkIn).toHaveBeenCalledWith('user-123', mockDto);
    expect(result).toEqual({
      message: 'Attendance checked in successfully',
      attendance: mockResponse,
    });
  });
});
