import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { User } from './user.entity';
import { IFindUserLogin } from './user.types';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findUserLogin(journalist_id: string): Promise<IFindUserLogin> {
    const syntax = `SELECT A.id, "password" as "hashPassword", D.status, C.id as "appId", B.uuid AS "accessId" FROM "user" A
      JOIN user_access B ON A.id = B."userId"
      JOIN master_app C ON C.id = B."masterAppId"
      JOIN user_journalist D ON A.id = D."userId"
      WHERE D.journalist_id = $1`;

    const result = await this.query(syntax, [journalist_id]);
    if (result.length > 0) return result[0];
    return null;
  }
}
