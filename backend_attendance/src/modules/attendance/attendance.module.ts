import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AttendanceController } from './attendance.controller.js';
import { AttendanceService } from './attendance.service.js';
import { StorageService } from './storage.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AttendanceController],
  providers: [AttendanceService, StorageService, JwtAuthGuard],
  exports: [AttendanceService, StorageService],
})
export class AttendanceModule {}
