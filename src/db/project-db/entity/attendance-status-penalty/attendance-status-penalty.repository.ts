import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { AttendanceStatusPenalty } from './attendance-status-penalty.entity';

@Injectable()
export class AttendanceStatusPenaltyRepository extends Repository<AttendanceStatusPenalty> {
  constructor(private dataSource: DataSource) {
    super(AttendanceStatusPenalty, dataSource.createEntityManager());
  }
}
