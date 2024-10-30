import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { MasterPermissionCategory } from './master-permission-category.entity';

@Injectable()
export class MasterPermissionCategoryRepository extends Repository<MasterPermissionCategory> {
  constructor(private dataSource: DataSource) {
    super(MasterPermissionCategory, dataSource.createEntityManager());
  }
}
