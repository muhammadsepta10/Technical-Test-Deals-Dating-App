import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { User } from './user.entity';
import { IFindUserLogin } from './user.types';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findUserLogin(username: string): Promise<IFindUserLogin> {
    const syntax = `SELECT A.id, "password" as "hashPassword", A.status, C.id as "appId", B."masterAccessId" AS "accessId" 
      FROM "user" A
      JOIN user_access B ON A.id = B."userId"
      JOIN master_app C ON C.id = B."masterAppId"
      WHERE A.username = $1`;

    const result = await this.query(syntax, [username]);
    if (result.length > 0) return result[0];
    return null;
  }
}
