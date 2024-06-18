import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { MasterBank } from './master-bank.entity';

@Injectable()
export class MasterBankRepository extends Repository<MasterBank> {
  constructor(private dataSource: DataSource) {
    super(MasterBank, dataSource.createEntityManager());
  }
}
