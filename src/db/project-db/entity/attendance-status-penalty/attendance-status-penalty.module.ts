import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceStatusPenalty } from './attendance-status-penalty.entity';
import { AttendanceStatusPenaltyRepository } from './attendance-status-penalty.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceStatusPenalty])],
  exports: [TypeOrmModule, AttendanceStatusPenaltyRepository],
  providers: [AttendanceStatusPenaltyRepository]
})
export class AttendanceStatusPenaltyDbModule {}
