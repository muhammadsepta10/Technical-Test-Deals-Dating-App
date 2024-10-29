import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { MasterPermitType } from './master-permit-type.entity';

@Injectable()
export class MasterPermitTypeRepository extends Repository<MasterPermitType> {
  constructor(private dataSource: DataSource) {
    super(MasterPermitType, dataSource.createEntityManager());
  }
}
