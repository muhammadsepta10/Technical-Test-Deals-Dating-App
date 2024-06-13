import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { MasterMenu } from './master-menu.entity';

@Injectable()
export class MasterMenuRepository extends Repository<MasterMenu> {
  constructor(private dataSource: DataSource) {
    super(MasterMenu, dataSource.createEntityManager());
  }
}
