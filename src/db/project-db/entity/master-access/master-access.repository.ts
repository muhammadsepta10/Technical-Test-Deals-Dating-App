import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { MasterAccess } from './master-access.entity';

@Injectable()
export class MasterAccessRepository extends Repository<MasterAccess> {
  constructor(private dataSource: DataSource) {
    super(MasterAccess, dataSource.createEntityManager());
  }
}
