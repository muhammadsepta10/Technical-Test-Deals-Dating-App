import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { EmployeePermitQuota } from './employee-permit-quota.entity';

@Injectable()
export class EmployeePermitQuotaRepository extends Repository<EmployeePermitQuota> {
  constructor(private dataSource: DataSource) {
    super(EmployeePermitQuota, dataSource.createEntityManager());
  }
}
