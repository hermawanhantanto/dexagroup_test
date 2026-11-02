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
      getEmployeeById: vi.fn(),
      getAllEmployees: vi.fn(),
      deleteEmployee: vi.fn(),
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

  describe('getEmployeeById', () => {
    it('should call employeesService.getEmployeeById and return employee response payload', async () => {
      const mockResult = {
        id: 'user-uuid-1',
        email: 'employee@example.com',
        firstName: 'John',
        position: 'Engineer',
      };

      employeesServiceMock.getEmployeeById.mockResolvedValue(mockResult);

      const response = await employeesController.getEmployeeById('user-uuid-1');

      expect(employeesServiceMock.getEmployeeById).toHaveBeenCalledWith(
        'user-uuid-1',
      );
      expect(response).toEqual({
        message: EMPLOYEE_CONSTANTS.GET_EMPLOYEE_SUCCESS_MESSAGE,
        data: mockResult,
      });
    });
  });

  describe('getAllEmployees', () => {
    it('should call employeesService.getAllEmployees and return paginated employees payload', async () => {
      const mockResult = {
        data: [
          {
            id: 'user-uuid-1',
            email: 'employee@example.com',
            firstName: 'John',
          },
        ],
        pagination: {
          totalRecords: 1,
          currentPage: 1,
          totalPages: 1,
          recordsPerPage: 10,
        },
      };

      employeesServiceMock.getAllEmployees.mockResolvedValue(mockResult);

      const queryDto = { page: 1, limit: 10, search: 'John' };
      const response = await employeesController.getAllEmployees(queryDto);

      expect(employeesServiceMock.getAllEmployees).toHaveBeenCalledWith(
        queryDto,
      );
      expect(response).toEqual({
        message: EMPLOYEE_CONSTANTS.GET_ALL_EMPLOYEES_SUCCESS_MESSAGE,
        data: mockResult.data,
        pagination: mockResult.pagination,
      });
    });
  });

  describe('deleteEmployee', () => {
    it('should call employeesService.deleteEmployee and return delete confirmation payload', async () => {
      const mockResult = { id: 'user-uuid-1' };
      employeesServiceMock.deleteEmployee.mockResolvedValue(mockResult);

      const response = await employeesController.deleteEmployee('user-uuid-1');

      expect(employeesServiceMock.deleteEmployee).toHaveBeenCalledWith(
        'user-uuid-1',
      );
      expect(response).toEqual({
        message: EMPLOYEE_CONSTANTS.DELETE_SUCCESS_MESSAGE,
        data: mockResult,
      });
    });
  });
});
