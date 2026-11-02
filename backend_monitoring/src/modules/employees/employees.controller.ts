import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { EMPLOYEE_CONSTANTS } from './employee.constants.js';
import { EmployeesService } from './employees.service.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';
import { GetEmployeesQueryDto } from './dto/get-employees-query.dto.js';

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

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllEmployees(@Query() queryDto: GetEmployeesQueryDto) {
    const result = await this.employeesService.getAllEmployees(queryDto);

    return {
      message: EMPLOYEE_CONSTANTS.GET_ALL_EMPLOYEES_SUCCESS_MESSAGE,
      data: result.data,
      pagination: result.pagination,
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

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getEmployeeById(@Param('id', new ParseUUIDPipe()) employeeId: string) {
    const retrievedEmployee =
      await this.employeesService.getEmployeeById(employeeId);

    return {
      message: EMPLOYEE_CONSTANTS.GET_EMPLOYEE_SUCCESS_MESSAGE,
      data: retrievedEmployee,
    };
  }
}
