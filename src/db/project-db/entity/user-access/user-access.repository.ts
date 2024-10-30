import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { UserAccess } from './user-access.entity';

@Injectable()
export class UserAccessRepository extends Repository<UserAccess> {
  constructor(private dataSource: DataSource) {
    super(UserAccess, dataSource.createEntityManager());
  }
}
