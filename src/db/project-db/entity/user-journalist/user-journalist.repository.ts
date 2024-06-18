import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { UserJournalist } from './user-journalist.entity';

@Injectable()
export class UserJournalistRepository extends Repository<UserJournalist> {
  constructor(private dataSource: DataSource) {
    super(UserJournalist, dataSource.createEntityManager());
  }
}
