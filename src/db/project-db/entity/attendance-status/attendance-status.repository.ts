import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { AttendanceStatus } from './attendance-status.entity';

@Injectable()
export class AttendanceStatusRepository extends Repository<AttendanceStatus> {
  constructor(private dataSource: DataSource) {
    super(AttendanceStatus, dataSource.createEntityManager());
  }
}
