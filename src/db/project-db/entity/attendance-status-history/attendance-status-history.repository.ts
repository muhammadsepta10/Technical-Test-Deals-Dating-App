import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { AttendanceStatusHistory } from './attendance-status-history.entity';

@Injectable()
export class AttendanceStatusHistoryRepository extends Repository<AttendanceStatusHistory> {
  constructor(private dataSource: DataSource) {
    super(AttendanceStatusHistory, dataSource.createEntityManager());
  }
}
