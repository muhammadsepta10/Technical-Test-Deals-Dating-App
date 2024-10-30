import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { MasterScript } from './master-script.entity';

@Injectable()
export class MasterScriptRepository extends Repository<MasterScript> {
  constructor(private dataSource: DataSource) {
    super(MasterScript, dataSource.createEntityManager());
  }
}
