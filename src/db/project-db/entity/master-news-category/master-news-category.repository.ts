import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { MasterNewsCategory } from './master-news-category.entity';

@Injectable()
export class MasterNewsCategoryRepository extends Repository<MasterNewsCategory> {
  constructor(private dataSource: DataSource) {
    super(MasterNewsCategory, dataSource.createEntityManager());
  }
}
