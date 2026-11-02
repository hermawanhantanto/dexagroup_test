import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EmployeesService } from './employees.service.js';
import { Gender, Role } from '../../generated/prisma/enums.js';
import { EMPLOYEE_CONSTANTS } from './employee.constants.js';

describe('EmployeesService', () => {
  let employeesService: EmployeesService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };

    employeesService = new EmployeesService(prismaMock);
  });

  describe('createEmployee', () => {
    it('should throw ConflictException when an employee with the email already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'existing-uuid',
        email: 'duplicate@example.com',
      });

      await expect(
        employeesService.createEmployee({
          email: '  DUPLICATE@example.com  ',
          password: 'password123',
          firstName: 'John',
        }),
      ).rejects.toThrow(ConflictException);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'duplicate@example.com' },
      });
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('should create employee with full optional fields and return sanitized record', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const mockCreatedRecord = {
        id: 'new-uuid',
        email: 'alice@example.com',
        password: 'hashed_password',
        refreshToken: null,
        firstName: 'Alice',
        lastName: 'Smith',
        position: 'Programmer',
        department: 'Engineering',
        dateOfBirth: new Date('1995-05-15T00:00:00.000Z'),
        gender: Gender.FEMALE,
        role: Role.EMPLOYEE,
        salary: 15000000,
        joinDate: new Date('2026-01-10T00:00:00.000Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.create.mockResolvedValue(mockCreatedRecord);

      const result = await employeesService.createEmployee({
        email: '  Alice@example.com ',
        password: 'securePassword123',
        firstName: ' Alice ',
        lastName: ' Smith ',
        position: ' Programmer ',
        department: ' Engineering ',
        dateOfBirth: '1995-05-15T00:00:00.000Z',
        gender: Gender.FEMALE,
        role: Role.EMPLOYEE,
        salary: 15000000,
        joinDate: '2026-01-10T00:00:00.000Z',
      });

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: 'alice@example.com',
          password: expect.any(String),
          firstName: 'Alice',
          lastName: 'Smith',
          position: 'Programmer',
          department: 'Engineering',
          dateOfBirth: new Date('1995-05-15T00:00:00.000Z'),
          gender: Gender.FEMALE,
          role: Role.EMPLOYEE,
          salary: 15000000,
          joinDate: new Date('2026-01-10T00:00:00.000Z'),
        },
      });

      const isPasswordHashedCorrectly = await bcrypt.compare(
        'securePassword123',
        prismaMock.user.create.mock.calls[0][0].data.password,
      );
      expect(isPasswordHashedCorrectly).toBe(true);

      expect((result as any).password).toBeUndefined();
      expect((result as any).refreshToken).toBeUndefined();
      expect(result.id).toBe('new-uuid');
      expect(result.firstName).toBe('Alice');
      expect(result.email).toBe('alice@example.com');
    });

    it('should default role to EMPLOYEE and optional fields to null when omitted', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const mockMinimalRecord = {
        id: 'minimal-uuid',
        email: 'bob@example.com',
        password: 'hashed_password',
        refreshToken: null,
        firstName: 'Bob',
        lastName: null,
        position: null,
        department: null,
        dateOfBirth: null,
        gender: null,
        role: Role.EMPLOYEE,
        salary: null,
        joinDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.create.mockResolvedValue(mockMinimalRecord);

      const result = await employeesService.createEmployee({
        email: 'bob@example.com',
        password: 'password123',
        firstName: 'Bob',
      });

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: 'bob@example.com',
          password: expect.any(String),
          firstName: 'Bob',
          lastName: null,
          position: null,
          department: null,
          dateOfBirth: null,
          gender: null,
          role: EMPLOYEE_CONSTANTS.DEFAULT_ROLE,
          salary: null,
          joinDate: null,
        },
      });

      expect((result as any).password).toBeUndefined();
      expect((result as any).refreshToken).toBeUndefined();
      expect(result.role).toBe(Role.EMPLOYEE);
    });
  });

  describe('updateEmployee', () => {
    it('should throw NotFoundException when employee does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        employeesService.updateEmployee('nonexistent-uuid', {
          firstName: 'NewName',
        }),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent-uuid' },
      });
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when updating email to an existing one used by another user', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'employee-1',
        email: 'old@example.com',
      });

      prismaMock.user.findFirst.mockResolvedValue({
        id: 'employee-2',
        email: 'taken@example.com',
      });

      await expect(
        employeesService.updateEmployee('employee-1', {
          email: 'taken@example.com',
        }),
      ).rejects.toThrow(ConflictException);

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: 'taken@example.com',
          NOT: { id: 'employee-1' },
        },
      });
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('should not throw ConflictException when email is unchanged', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'employee-1',
        email: 'same@example.com',
      });

      const mockUpdatedRecord = {
        id: 'employee-1',
        email: 'same@example.com',
        firstName: 'UpdatedFirst',
      };
      prismaMock.user.update.mockResolvedValue(mockUpdatedRecord);

      const result = await employeesService.updateEmployee('employee-1', {
        email: 'same@example.com',
        firstName: 'UpdatedFirst',
      });

      expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'employee-1' },
        data: {
          firstName: 'UpdatedFirst',
        },
      });
      expect(result.firstName).toBe('UpdatedFirst');
    });

    it('should hash new password and invalidate active refresh token when password is provided', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'employee-1',
        email: 'emp@example.com',
        refreshToken: 'old_active_refresh_token',
      });

      const mockUpdatedRecord = {
        id: 'employee-1',
        email: 'emp@example.com',
        password: 'hashed_new_password',
        refreshToken: null,
      };
      prismaMock.user.update.mockResolvedValue(mockUpdatedRecord);

      const result = await employeesService.updateEmployee('employee-1', {
        password: 'brandNewPassword123',
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'employee-1' },
        data: {
          password: expect.any(String),
          refreshToken: null,
        },
      });

      const isPasswordUpdated = await bcrypt.compare(
        'brandNewPassword123',
        prismaMock.user.update.mock.calls[0][0].data.password,
      );
      expect(isPasswordUpdated).toBe(true);

      expect((result as any).password).toBeUndefined();
      expect((result as any).refreshToken).toBeUndefined();
    });

    it('should update metadata fields, dates, role, and salary, returning sanitized employee', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'employee-1',
        email: 'emp@example.com',
      });

      const mockUpdatedRecord = {
        id: 'employee-1',
        email: 'emp@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        position: 'Lead QA',
        department: 'Quality Assurance',
        dateOfBirth: new Date('1992-03-20T00:00:00.000Z'),
        gender: Gender.FEMALE,
        role: Role.HR_ADMIN,
        salary: 22000000,
        joinDate: new Date('2025-06-01T00:00:00.000Z'),
      };
      prismaMock.user.update.mockResolvedValue(mockUpdatedRecord);

      const result = await employeesService.updateEmployee('employee-1', {
        firstName: '  Jane ',
        lastName: ' Doe ',
        position: ' Lead QA ',
        department: ' Quality Assurance ',
        dateOfBirth: '1992-03-20T00:00:00.000Z',
        gender: Gender.FEMALE,
        role: Role.HR_ADMIN,
        salary: 22000000,
        joinDate: '2025-06-01T00:00:00.000Z',
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'employee-1' },
        data: {
          firstName: 'Jane',
          lastName: 'Doe',
          position: 'Lead QA',
          department: 'Quality Assurance',
          dateOfBirth: new Date('1992-03-20T00:00:00.000Z'),
          gender: Gender.FEMALE,
          role: Role.HR_ADMIN,
          salary: 22000000,
          joinDate: new Date('2025-06-01T00:00:00.000Z'),
        },
      });

      expect(result.position).toBe('Lead QA');
      expect(result.salary).toBe(22000000);
      expect(result.role).toBe(Role.HR_ADMIN);
    });
  });

  describe('getEmployeeById', () => {
    it('should throw NotFoundException when employee does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        employeesService.getEmployeeById('nonexistent-uuid'),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent-uuid' },
      });
    });

    it('should return sanitized employee when employee exists', async () => {
      const mockEmployee = {
        id: 'employee-123',
        email: 'employee@example.com',
        password: 'hashed_password',
        refreshToken: 'hashed_refresh_token',
        firstName: 'John',
        lastName: 'Doe',
        position: 'Software Engineer',
        department: 'Engineering',
        dateOfBirth: new Date('1990-01-01T00:00:00.000Z'),
        gender: Gender.MALE,
        role: Role.EMPLOYEE,
        salary: 10000000,
        joinDate: new Date('2024-01-01T00:00:00.000Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.findUnique.mockResolvedValue(mockEmployee);

      const result = await employeesService.getEmployeeById('employee-123');

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'employee-123' },
      });
      expect(result.id).toBe('employee-123');
      expect(result.email).toBe('employee@example.com');
      expect((result as any).password).toBeUndefined();
      expect((result as any).refreshToken).toBeUndefined();
    });
  });
});
