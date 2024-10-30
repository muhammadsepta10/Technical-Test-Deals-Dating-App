import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { MasterMedia } from './master-media.entity';

@Injectable()
export class MasterMediaRepository extends Repository<MasterMedia> {
  constructor(private dataSource: DataSource) {
    super(MasterMedia, dataSource.createEntityManager());
  }
}
