import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { UserEmployee } from './user-employee.entity';

@Injectable()
export class UserEmployeeRepository extends Repository<UserEmployee> {
  constructor(private dataSource: DataSource) {
    super(UserEmployee, dataSource.createEntityManager());
  }
}
