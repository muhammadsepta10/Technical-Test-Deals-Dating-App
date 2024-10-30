import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { AttendanceStatusDet } from './attendance-status-det.entity';

@Injectable()
export class AttendanceStatusDetRepository extends Repository<AttendanceStatusDet> {
  constructor(private dataSource: DataSource) {
    super(AttendanceStatusDet, dataSource.createEntityManager());
  }
}
