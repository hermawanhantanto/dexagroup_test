import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictException } from '@nestjs/common';
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
        create: vi.fn(),
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
});
