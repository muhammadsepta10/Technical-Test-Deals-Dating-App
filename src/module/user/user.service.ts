import { ProjectDbConfigService } from '@common/config/db/project-db/config.service';
import { CommonService } from '@common/service/common.service';
import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MasterAccessRepository } from 'src/db/project-db/entity/master-access/master-access.repository';
import { MasterAppRepository } from 'src/db/project-db/entity/master-app/master-app.repository';
import { UserAccess } from 'src/db/project-db/entity/user-access/user-access.entity';
import { UserAccessRepository } from 'src/db/project-db/entity/user-access/user-access.repository';
import { UserRepository } from 'src/db/project-db/entity/user/user.repository';
import { CreateUserDTO } from './user.dto';
import { AppConfigService } from '@common/config/api/config.service';
// import {CreateUserDTO, UpdatePasswordDTO} from "src/dto/user.dto";

@Injectable()
export class UserService {
  constructor(
    private commonService: CommonService,
    private projectDbConfigService: ProjectDbConfigService,
    private appConfigService: AppConfigService
  ) {}
  @InjectRepository(UserRepository)
  private userRepository: UserRepository;

  @InjectRepository(MasterAccessRepository)
  private masterAccessRepository: MasterAccessRepository;

  @InjectRepository(UserAccessRepository)
  private userAccessRepository: UserAccessRepository;

  @InjectRepository(MasterAppRepository)
  private masterAppRepository: MasterAppRepository;

  async createUser(param: CreateUserDTO, userId, file: Express.Multer.File) {
    const dataSource = await this.projectDbConfigService.dbConnection();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const urlFile = file ? `'${this.appConfigService.BASE_URL + '/journalist_doc/' + file.filename}'` : '';
      const { accessId, appId, name, password, username } = param;
      const user = await this.userRepository.findUserLogin(username);
      if (!user) {
        throw new BadRequestException('User Alaready Exist');
      }
      const masterAccess = await this.masterAccessRepository.findOne({ where: { id: accessId }, select: ['id'] });
      if (!masterAccess) {
        throw new BadRequestException('Invalid Access');
      }
      const masterApp = await this.masterAppRepository.findOne({ where: { id: appId }, select: ['id'] });
      if (!masterApp) {
        throw new BadRequestException('Invalid App');
      }
      const hashPassword = await this.commonService.bcrpytSign(password);
      const createUser = await this.userRepository.insert({
        name,
        password: hashPassword,
        username,
        photo: urlFile,
        status: 1
      });
      await this.userAccessRepository.insert({
        userId: createUser.identifiers[0].id,
        masterAppId: appId,
        masterAccessId: accessId,
        createdById: userId,
        status: 1
      });
      await queryRunner.commitTransaction();
      return { message: 'create user success' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (!error?.response || !error?.status) {
        throw new InternalServerErrorException(error);
      }
      throw new HttpException(error?.response, error?.status);
    } finally {
      await queryRunner.release();
    }
  }

  async getMe(userId: number, appId: number) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.userAccess', 'ua')
      .innerJoin('ua.masterAccess', 'access')
      .leftJoin('user.UserJournalist', 'UserJournalist')
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
}
