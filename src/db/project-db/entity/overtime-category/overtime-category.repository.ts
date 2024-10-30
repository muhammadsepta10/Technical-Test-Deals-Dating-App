import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { OvertimeCategory } from './overtime-category.entity';

@Injectable()
export class OvertimeCategoryRepository extends Repository<OvertimeCategory> {
  constructor(private dataSource: DataSource) {
    super(OvertimeCategory, dataSource.createEntityManager());
  }
}
