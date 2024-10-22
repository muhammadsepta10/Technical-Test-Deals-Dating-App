import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceStatusHistory } from './attendance-status-history.entity';
import { AttendanceStatusHistoryRepository } from './attendance-status-history.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceStatusHistory])],
  exports: [TypeOrmModule, AttendanceStatusHistoryRepository],
  providers: [AttendanceStatusHistoryRepository]
})
export class AttendanceStatusHistoryDbModule {}
