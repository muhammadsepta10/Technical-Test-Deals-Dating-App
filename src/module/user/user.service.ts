import { ProjectDbConfigService } from '@common/config/db/project-db/config.service';
import { CommonService } from '@common/service/common.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MasterAccessRepository } from 'src/db/project-db/entity/master-access/master-access.repository';
import { MasterAppRepository } from 'src/db/project-db/entity/master-app/master-app.repository';
import { UserAccess } from 'src/db/project-db/entity/user-access/user-access.entity';
import { UserAccessRepository } from 'src/db/project-db/entity/user-access/user-access.repository';
import { UserRepository } from 'src/db/project-db/entity/user/user.repository';
// import {CreateUserDTO, UpdatePasswordDTO} from "src/dto/user.dto";

@Injectable()
export class UserService {
  constructor(
    private commonService: CommonService,
    private projectDbConfigService: ProjectDbConfigService
  ) {}
  @InjectRepository(UserRepository)
  private userRepository: UserRepository;

  @InjectRepository(MasterAccessRepository)
  private masterAccessRepository: MasterAccessRepository;

  @InjectRepository(UserAccessRepository)
  private userAccessRepository: UserAccessRepository;

  @InjectRepository(MasterAppRepository)
  private masterAppRepository: MasterAppRepository;

  async getMe(userId: number, appId: number) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.userAccess', 'ua')
      .innerJoin('ua.masterAccess', 'access')
      .select('user.username', 'username')
      .addSelect('user.name', 'name')
      .addSelect('user.photo', 'photo')
      .addSelect('access.description', 'access')
      .addSelect('user.uuid', 'id')
      .where(`user.id = :userId AND ua.masterAppId = :appId`, { userId, appId })
      .getRawOne();
    const userProps = Object.keys(user);
    const userValue = Object.values(user);
    let userRfct = {};
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
          userRfct[objName] = { ...userRfct[objName], [propName]: userValue[index] };
        }
      }
      if (!objName) {
        userRfct = { ...userRfct, [propName]: userValue[index] };
      }
    }
    return userRfct;
  }

  // async changePassword(param: UpdatePasswordDTO, userId: number) {
  //     const dataSource = await this.projectDbConfigService.dbConnection();
  //     const queryRunner = dataSource.createQueryRunner();
  //     await queryRunner.connect();
  //     await queryRunner.startTransaction();
  //     try {
  //         let {password} = param
  //         const hashPassword = await this.commonService.bcrpytSign(password)
  //         const updatePass = await queryRunner.manager.update(User, {id: userId}, {password: hashPassword})
  //         if (updatePass.affected < 1) {
  //             throw new BadRequestException("Invalid Change Password")
  //         }
  //         await queryRunner.commitTransaction()
  //         return "Success Change Password"
  //     } catch (error) {
  //         await queryRunner.rollbackTransaction();
  //         if (!error?.response || !error?.status) {
  //             throw new InternalServerErrorException(error);
  //         }
  //         throw new HttpException(error?.response, error?.status);
  //     } finally {
  //         await queryRunner.release()
  //     }
  // }

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
      .innerJoin('userAccess.masterAccess', 'masterAccess')
      .select('user.uuid', 'id')
      .addSelect('user.name', 'name')
      .addSelect('user.username', 'email')
      .addSelect('masterAccess.description', 'role')
      .addSelect("(CASE WHEN user.status = '1' THEN 'ACTIVE' ELSE 'INACTIVE' END)", 'status')
      .getRawMany();
    return users;
  }

  // async createUser(param: CreateUserDTO, user) {
  //     const dataSource = await this.projectDbConfigService.dbConnection();
  //     const queryRunner = dataSource.createQueryRunner();
  //     await queryRunner.connect();
  //     await queryRunner.startTransaction();
  //     try {
  //         let {accessId, email, name, password, appId: apps} = param
  //         const hashPassword = await this.commonService.bcrpytSign(password)
  //         let userCreated = await this.userRepository.findOne({where: {username: email}, select: ["id"]})
  //         const access = await this.masterAccessRepository.findOne({where: {uuid: accessId}, select: ['id']})
  //         if (userCreated) {
  //             throw new BadRequestException("Email Already Use")
  //         }
  //         userCreated = await this.userRepository.insert({
  //             name,
  //             username: email,
  //             password: hashPassword
  //         }).then(v => v.raw[0])
  //         for (let index = 0; index < apps.length; index++) {
  //             const appId = apps[index];
  //             const app = await this.masterAppRepository.findOne({where: {id: appId}, select: ["id"]})
  //             if (!app) {
  //                 throw new BadRequestException("Invalid App")
  //             }
  //             await queryRunner.manager.insert(UserAccess, {
  //                 masterAccessId: access.id,
  //                 userId: userCreated.id,
  //                 masterAppId: app.id,
  //                 status: 1,
  //                 createdById: user
  //             })
  //         }
  //         await queryRunner.commitTransaction()
  //         return userCreated
  //     } catch (error) {
  //         await queryRunner.rollbackTransaction();
  //         if (!error?.response || !error?.status) {
  //             throw new InternalServerErrorException(error);
  //         }
  //         throw new HttpException(error?.response, error?.status);
  //     } finally {
  //         await queryRunner.release()
  //     }
  // }
}
