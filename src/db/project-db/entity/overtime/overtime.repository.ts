import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Overtime } from './overtime.entity';

@Injectable()
export class OvertimeRepository extends Repository<Overtime> {
  constructor(private dataSource: DataSource) {
    super(Overtime, dataSource.createEntityManager());
  }
}
