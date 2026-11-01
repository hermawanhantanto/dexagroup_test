import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AUTH_CONSTANTS } from '../auth/auth.constants.js';
import {
  EMPLOYEE_CONSTANTS,
  EMPLOYEE_ERROR_MESSAGES,
} from './employee.constants.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async createEmployee(createEmployeeDto: CreateEmployeeDto) {
    const normalizedEmail = createEmployeeDto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException(EMPLOYEE_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(
      createEmployeeDto.password,
      AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS,
    );

    const parsedDateOfBirth = createEmployeeDto.dateOfBirth
      ? new Date(createEmployeeDto.dateOfBirth)
      : null;

    const parsedJoinDate = createEmployeeDto.joinDate
      ? new Date(createEmployeeDto.joinDate)
      : null;

    const assignedRole =
      createEmployeeDto.role || EMPLOYEE_CONSTANTS.DEFAULT_ROLE;

    const employeeSalary = createEmployeeDto.salary ?? null;

    const createdUser = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        firstName: createEmployeeDto.firstName.trim(),
        lastName: createEmployeeDto.lastName
          ? createEmployeeDto.lastName.trim()
          : null,
        position: createEmployeeDto.position
          ? createEmployeeDto.position.trim()
          : null,
        department: createEmployeeDto.department
          ? createEmployeeDto.department.trim()
          : null,
        dateOfBirth: parsedDateOfBirth,
        gender: createEmployeeDto.gender ?? null,
        role: assignedRole,
        salary: employeeSalary,
        joinDate: parsedJoinDate,
      },
    });

    const {
      password: _excludedPassword,
      refreshToken: _excludedRefreshToken,
      ...sanitizedEmployee
    } = createdUser;

    return sanitizedEmployee;
  }
}
