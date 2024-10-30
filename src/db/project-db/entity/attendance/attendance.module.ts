import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './attendance.entity';
import { AttendanceRepository } from './attendance.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance])],
  exports: [TypeOrmModule, AttendanceRepository],
  providers: [AttendanceRepository]
})
export class AttendanceDbModule {}
