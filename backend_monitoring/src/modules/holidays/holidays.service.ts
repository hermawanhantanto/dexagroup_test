import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { HOLIDAY_ERROR_MESSAGES } from './holiday.constants.js';
import { CreateHolidayDto } from './dto/create-holiday.dto.js';

@Injectable()
export class HolidaysService {
  constructor(private readonly prisma: PrismaService) {}

  async createHoliday(createHolidayDto: CreateHolidayDto) {
    const rawHolidayDate = new Date(createHolidayDto.holidayDate);
    const normalizedHolidayDate = new Date(
      Date.UTC(
        rawHolidayDate.getUTCFullYear(),
        rawHolidayDate.getUTCMonth(),
        rawHolidayDate.getUTCDate(),
      ),
    );

    const existingHoliday = await this.prisma.holiday.findUnique({
      where: { holidayDate: normalizedHolidayDate },
    });

    if (existingHoliday) {
      throw new ConflictException(
        HOLIDAY_ERROR_MESSAGES.HOLIDAY_ALREADY_EXISTS,
      );
    }

    const createdHoliday = await this.prisma.holiday.create({
      data: {
        holidayDate: normalizedHolidayDate,
        name: createHolidayDto.name.trim(),
        description: createHolidayDto.description
          ? createHolidayDto.description.trim()
          : null,
      },
    });

    return createdHoliday;
  }

  async getAllHolidays() {
    const holidays = await this.prisma.holiday.findMany({
      orderBy: { holidayDate: 'asc' },
    });

    return holidays;
  }

  async deleteHoliday(holidayId: string) {
    const existingHoliday = await this.prisma.holiday.findUnique({
      where: { id: holidayId },
    });

    if (!existingHoliday) {
      throw new NotFoundException(HOLIDAY_ERROR_MESSAGES.HOLIDAY_NOT_FOUND);
    }

    await this.prisma.holiday.delete({
      where: { id: holidayId },
    });

    return { id: holidayId };
  }
}
