import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceStatus } from './attendance-status.entity';
import { AttendanceStatusRepository } from './attendance-status.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceStatus])],
  exports: [TypeOrmModule, AttendanceStatusRepository],
  providers: [AttendanceStatusRepository]
})
export class AttendanceStatusDbModule {}
