import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AttendanceController } from './attendance.controller.js';
import { AttendanceService } from './attendance.service.js';
import { StorageModule } from '../../storage/storage.module.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@Module({
  imports: [JwtModule.register({}), StorageModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, JwtAuthGuard],
  exports: [AttendanceService],
})
export class AttendanceModule {}
