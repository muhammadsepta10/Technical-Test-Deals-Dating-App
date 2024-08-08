import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { MasterWorkUnit } from './master-work-unit.entity';

@Injectable()
export class MasterWorkUnitRepository extends Repository<MasterWorkUnit> {
  constructor(private dataSource: DataSource) {
    super(MasterWorkUnit, dataSource.createEntityManager());
  }
}
