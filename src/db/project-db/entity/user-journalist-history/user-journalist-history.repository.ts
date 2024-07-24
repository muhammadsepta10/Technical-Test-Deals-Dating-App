import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { UserJournalistHistory } from './user-journalist-history.entity';

@Injectable()
export class UserJournalistHistoryRepository extends Repository<UserJournalistHistory> {
  constructor(private dataSource: DataSource) {
    super(UserJournalistHistory, dataSource.createEntityManager());
  }
}
