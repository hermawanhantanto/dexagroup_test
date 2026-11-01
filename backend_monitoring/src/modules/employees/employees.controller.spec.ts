import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmployeesController } from './employees.controller.js';
import { EMPLOYEE_CONSTANTS } from './employee.constants.js';

describe('EmployeesController', () => {
  let employeesController: EmployeesController;
  let employeesServiceMock: any;

  beforeEach(() => {
    employeesServiceMock = {
      createEmployee: vi.fn(),
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
});
