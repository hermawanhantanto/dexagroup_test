import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { HOLIDAY_CONSTANTS } from './holiday.constants.js';
import { HolidaysService } from './holidays.service.js';
import { CreateHolidayDto } from './dto/create-holiday.dto.js';

@UseGuards(JwtAuthGuard)
@Controller([HOLIDAY_CONSTANTS.ROUTE, 'holiday'])
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createHoliday(@Body() createHolidayDto: CreateHolidayDto) {
    const createdHoliday =
      await this.holidaysService.createHoliday(createHolidayDto);

    return {
      message: HOLIDAY_CONSTANTS.CREATE_SUCCESS_MESSAGE,
      data: createdHoliday,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllHolidays() {
    const holidays = await this.holidaysService.getAllHolidays();

    return {
      message: HOLIDAY_CONSTANTS.GET_ALL_SUCCESS_MESSAGE,
      data: holidays,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteHoliday(@Param('id', new ParseUUIDPipe()) holidayId: string) {
    const deletedHoliday = await this.holidaysService.deleteHoliday(holidayId);

    return {
      message: HOLIDAY_CONSTANTS.DELETE_SUCCESS_MESSAGE,
      data: deletedHoliday,
    };
  }
}
