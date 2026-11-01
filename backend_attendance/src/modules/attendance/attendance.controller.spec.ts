import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AttendanceController } from './attendance.controller.js';

describe('AttendanceController', () => {
  let attendanceController: AttendanceController;
  let attendanceServiceMock: any;

  beforeEach(() => {
    attendanceServiceMock = {
      checkIn: vi.fn(),
      getTodayStatus: vi.fn(),
      clockOut: vi.fn(),
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

  it('should call attendanceService.getTodayStatus with user sub', async () => {
    const mockUser = { sub: 'user-123', email: 'emp@dexa.com', role: 'EMPLOYEE' };
    const mockStatus = { hasCheckedIn: true, hasClockedOut: false, attendance: {} };
    attendanceServiceMock.getTodayStatus.mockResolvedValue(mockStatus);

    const result = await attendanceController.getTodayStatus(mockUser);

    expect(attendanceServiceMock.getTodayStatus).toHaveBeenCalledWith('user-123');
    expect(result).toEqual(mockStatus);
  });

  it('should call attendanceService.clockOut with user sub and dto', async () => {
    const mockUser = { sub: 'user-123', email: 'emp@dexa.com', role: 'EMPLOYEE' };
    const mockClockOutDto = { notes: 'EOD wrap-up' };
    const mockResponse = { id: 'att-1', clockOutAt: new Date(), notes: 'EOD wrap-up' };

    attendanceServiceMock.clockOut.mockResolvedValue(mockResponse);

    const result = await attendanceController.clockOut(mockUser, mockClockOutDto);

    expect(attendanceServiceMock.clockOut).toHaveBeenCalledWith('user-123', mockClockOutDto);
    expect(result).toEqual({
      message: 'Attendance clocked out successfully',
      attendance: mockResponse,
    });
  });
});
