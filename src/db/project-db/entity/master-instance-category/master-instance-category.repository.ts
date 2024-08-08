import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { MasterInstanceCategory } from './master-instance-category.entity';

@Injectable()
export class MasterInstanceCategoryRepository extends Repository<MasterInstanceCategory> {
  constructor(private dataSource: DataSource) {
    super(MasterInstanceCategory, dataSource.createEntityManager());
  }
}
