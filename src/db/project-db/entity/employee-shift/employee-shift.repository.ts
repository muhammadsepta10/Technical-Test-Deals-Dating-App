import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { EmployeeShift } from './employee-shift.entity';

@Injectable()
export class EmployeeShiftRepository extends Repository<EmployeeShift> {
  constructor(private dataSource: DataSource) {
    super(EmployeeShift, dataSource.createEntityManager());
  }
}
