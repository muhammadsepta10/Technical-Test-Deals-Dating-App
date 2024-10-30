import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceSummary } from './attendance-summary.entity';
import { AttendanceSummaryRepository } from './attendance-summary.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceSummary])],
  exports: [TypeOrmModule, AttendanceSummaryRepository],
  providers: [AttendanceSummaryRepository]
})
export class AttendanceSummaryDbModule {}
