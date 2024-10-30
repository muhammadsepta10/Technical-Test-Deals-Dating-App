import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { MasterNotificationCategory } from './notification-category.entity';

@Injectable()
export class MasterNotificationCategoryRepository extends Repository<MasterNotificationCategory> {
  constructor(private dataSource: DataSource) {
    super(MasterNotificationCategory, dataSource.createEntityManager());
  }
}
