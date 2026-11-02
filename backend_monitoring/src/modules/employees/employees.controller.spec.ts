import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmployeesController } from './employees.controller.js';
import { EMPLOYEE_CONSTANTS } from './employee.constants.js';

describe('EmployeesController', () => {
  let employeesController: EmployeesController;
  let employeesServiceMock: any;

  beforeEach(() => {
    employeesServiceMock = {
      createEmployee: vi.fn(),
      updateEmployee: vi.fn(),
    };
    employeesController = new EmployeesController(employeesServiceMock);
  });

  describe('createEmployee', () => {
    it('should call employeesService.createEmployee and return success response payload', async () => {
      const mockResult = {
        id: 'user-uuid-1',
        email: 'employee@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'EMPLOYEE',
      };

      employeesServiceMock.createEmployee.mockResolvedValue(mockResult);

      const payload = {
        email: 'employee@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const response = await employeesController.createEmployee(payload);

      expect(employeesServiceMock.createEmployee).toHaveBeenCalledWith(payload);
      expect(response).toEqual({
        message: EMPLOYEE_CONSTANTS.CREATE_SUCCESS_MESSAGE,
        data: mockResult,
      });
    });
  });

  describe('updateEmployee', () => {
    it('should call employeesService.updateEmployee and return updated employee response payload', async () => {
      const mockResult = {
        id: 'user-uuid-1',
        email: 'employee@example.com',
        firstName: 'John Updated',
        position: 'Senior Engineer',
      };

      employeesServiceMock.updateEmployee.mockResolvedValue(mockResult);

      const payload = {
        firstName: 'John Updated',
        position: 'Senior Engineer',
      };

      const response = await employeesController.updateEmployee(
        'user-uuid-1',
        payload,
      );

      expect(employeesServiceMock.updateEmployee).toHaveBeenCalledWith(
        'user-uuid-1',
        payload,
      );
      expect(response).toEqual({
        message: EMPLOYEE_CONSTANTS.UPDATE_SUCCESS_MESSAGE,
        data: mockResult,
      });
    });
  });
});
