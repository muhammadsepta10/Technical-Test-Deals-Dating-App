import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceStatusDet } from './attendance-status-det.entity';
import { AttendanceStatusDetRepository } from './attendance-status-det.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceStatusDet])],
  exports: [TypeOrmModule, AttendanceStatusDetRepository],
  providers: [AttendanceStatusDetRepository]
})
export class AttendanceStatusDetDbModule {}
