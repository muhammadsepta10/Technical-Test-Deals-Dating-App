import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Attendance } from './attendance.entity';

@Injectable()
export class AttendanceRepository extends Repository<Attendance> {
  constructor(private dataSource: DataSource) {
    super(Attendance, dataSource.createEntityManager());
  }
}
