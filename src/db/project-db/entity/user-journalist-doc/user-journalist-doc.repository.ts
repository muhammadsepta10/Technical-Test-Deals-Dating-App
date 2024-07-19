import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { UserJournalistDoc } from './user-journalist-doc.entity';

@Injectable()
export class UserJournalistDocRepository extends Repository<UserJournalistDoc> {
  constructor(private dataSource: DataSource) {
    super(UserJournalistDoc, dataSource.createEntityManager());
  }
}
