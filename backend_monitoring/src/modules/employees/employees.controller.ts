import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { EMPLOYEE_CONSTANTS } from './employee.constants.js';
import { EmployeesService } from './employees.service.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';

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

  @Patch(':id')
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateEmployee(
    @Param('id', new ParseUUIDPipe()) employeeId: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    const updatedEmployee = await this.employeesService.updateEmployee(
      employeeId,
      updateEmployeeDto,
    );

    return {
      message: EMPLOYEE_CONSTANTS.UPDATE_SUCCESS_MESSAGE,
      data: updatedEmployee,
    };
  }
}
