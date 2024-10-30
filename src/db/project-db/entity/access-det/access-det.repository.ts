import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { AccessDet } from './access-det.entity';

@Injectable()
export class AccessDetRepository extends Repository<AccessDet> {
  constructor(private dataSource: DataSource) {
    super(AccessDet, dataSource.createEntityManager());
  }
}
