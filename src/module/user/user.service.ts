import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MasterAccessRepository } from 'src/db/project-db/entity/master-access/master-access.repository';
import { UserAccess } from 'src/db/project-db/entity/user-access/user-access.entity';
import { UserRepository } from 'src/db/project-db/entity/user/user.repository';
// import {CreateUserDTO, UpdatePasswordDTO} from "src/dto/user.dto";

@Injectable()
export class UserService {
  constructor() {}
  @InjectRepository(UserRepository)
  private userRepository: UserRepository;

  @InjectRepository(MasterAccessRepository)
  private masterAccessRepository: MasterAccessRepository;

  async getMe(userId: number) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.userAccess', 'ua')
      .innerJoin('ua.masterAccess', 'access')
      .leftJoin('user.userEmployee', 'userEmployee')
      .select('user.username', 'username')
      .addSelect('user.name', 'name')
      .addSelect('user.photo', 'photo')
      .addSelect('access.description', 'access')
      .addSelect('userEmployee.uuid', 'employeeId')
      .addSelect('user.uuid', 'id')
      .where(`user.id = :userId`, { userId })
      .getRawOne();
    const userProps = Object.keys(user);
    const userValue = Object.values(user);
    let userRfct;
    for (let index = 0; index < userProps.length; index++) {
      const userProp = userProps[index];
      const userPropArr = userProp.split('_');
      const objName = userPropArr.length < 2 ? null : userPropArr[0];
      const propName = userPropArr.length < 2 ? userPropArr[0] : userPropArr[1];
      if (objName) {
        if (!userRfct?.[objName]) {
          userRfct[objName] = {};
        }
        if (userValue[0]) {
          userRfct[objName] = {
            ...userRfct[objName],
            [propName]: userValue?.[index] || ''
          };
        }
      }
      if (!objName) {
        userRfct = { ...userRfct, [propName]: userValue?.[index] || '' };
      }
    }
    return userRfct;
  }

  async getRole(userId: number, appId: number): Promise<{ code: string; name: string; id: number }> {
    const access = await this.masterAccessRepository
      .createQueryBuilder('access')
      .innerJoin('access.userAccess', 'userAccess')
      .where('userAccess.userId = :userId AND userAccess.masterAppId = :appId', { userId, appId })
      .select('access.code', 'code')
      .addSelect('access.id', 'id')
      .addSelect('access.description', 'name')
      .getRawOne();
    return access;
  }

  async getListUser() {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndMapOne('user.userAccess', UserAccess, 'userAccess', '"userAccess"."userId" = user.id')
      .leftJoin('user.userEmployee', 'userEmployee')
      .innerJoin('userAccess.masterAccess', 'masterAccess')
      .select('user.uuid', 'id')
      .addSelect('user.name', 'name')
      .addSelect('userEmployee.uuid', 'employeeId')
      .addSelect('user.username', 'email')
      .addSelect('masterAccess.description', 'role')
      .addSelect("(CASE WHEN user.status = '1' THEN 'ACTIVE' ELSE 'INACTIVE' END)", 'status')
      .getRawMany();
    return users;
  }
}
