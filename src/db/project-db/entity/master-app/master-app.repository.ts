import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { MasterApp } from './master-app.entity';

@Injectable()
export class MasterAppRepository extends Repository<MasterApp> {
  constructor(private dataSource: DataSource) {
    super(MasterApp, dataSource.createEntityManager());
  }
}
