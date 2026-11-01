import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { EMPLOYEE_CONSTANTS } from './employee.constants.js';
import { EmployeesService } from './employees.service.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';

@UseGuards(JwtAuthGuard)
@Controller(EMPLOYEE_CONSTANTS.ROUTE)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    const createdEmployee =
      await this.employeesService.createEmployee(createEmployeeDto);

    return {
      message: EMPLOYEE_CONSTANTS.CREATE_SUCCESS_MESSAGE,
      data: createdEmployee,
    };
  }
}
