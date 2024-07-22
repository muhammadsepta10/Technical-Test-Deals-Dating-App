import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { MasterInvalidReason } from './master-invalid-reason.entity';

@Injectable()
export class MasterInvalidReasonRepository extends Repository<MasterInvalidReason> {
  constructor(private dataSource: DataSource) {
    super(MasterInvalidReason, dataSource.createEntityManager());
  }
}
