import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { MasterCabang } from './master-cabang.entity';

@Injectable()
export class MasterCabangRepository extends Repository<MasterCabang> {
  constructor(private dataSource: DataSource) {
    super(MasterCabang, dataSource.createEntityManager());
  }
}
