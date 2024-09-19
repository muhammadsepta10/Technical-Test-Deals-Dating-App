import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { AttendanceSummary } from './attendance-summary.entity';

@Injectable()
export class AttendanceSummaryRepository extends Repository<AttendanceSummary> {
  constructor(private dataSource: DataSource) {
    super(AttendanceSummary, dataSource.createEntityManager());
  }
}
