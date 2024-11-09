import { CommonService } from '@common/service/common.service';
import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceDto, LoginDTO, RegisterDTO } from './auth.dto';
import * as dayjs from 'dayjs';
import { LoginSessionRepository } from 'src/db/project-db/entity/login-session/login-session.repository';
import { UserRepository } from 'src/db/project-db/entity/user/user.repository';
import { MasterAccessRepository } from 'src/db/project-db/entity/master-access/master-access.repository';
import { ProjectDbConfigService } from '@common/config/db/project-db/config.service';
import { UserDeviceRepository } from 'src/db/project-db/entity/user_device/user_device.repository';
import { DeviceRepository } from 'src/db/project-db/entity/device/device.repository';
import { QueryRunner } from 'typeorm';
import { UserAccessRepository } from 'src/db/project-db/entity/user-access/user-access.repository';

@Injectable()
export class AuthService {
  constructor(
    private commonService: CommonService,
    private projectDbConfigService: ProjectDbConfigService
  ) {}

  @InjectRepository(UserRepository)
  private userRepository: UserRepository;
  @InjectRepository(LoginSessionRepository)
  private loginSessionRepository: LoginSessionRepository;
  @InjectRepository(MasterAccessRepository)
  private masterAccessRepository: MasterAccessRepository;
  @InjectRepository(UserDeviceRepository)
  private userDeviceRepository: UserDeviceRepository;
  @InjectRepository(DeviceRepository)
  private deviceRepository: DeviceRepository;
  @InjectRepository(UserAccessRepository)
  private userAccessRepository: UserAccessRepository;

  async login(param: LoginDTO) {
    const { password, username } = param;
    const user = await this.userRepository.findUserLogin(username);
    if (!user) {
      throw new BadRequestException('invalid username or password');
    }
    const { status, id, hashPassword, accessId } = user;
    if (status != 1) {
      throw new BadRequestException('verified your user');
    }
    const comparePassword = await this.commonService.bcrpytCompare(password, hashPassword);
    if (!comparePassword) {
      throw new BadRequestException('Your Password is incorrect');
    }
    const token = await this._genToken(id, accessId);
    return { token, message: 'Succes login' };
  }

  private async _genToken(userId: number, accessId?: number, appId?: number, masterMediaId?: number) {
    masterMediaId = +masterMediaId || null;
    const { COOKIES_EXPIRATION_DAY } = await this.commonService.generalParameter();
    const expiredDate = dayjs()
      .add(+COOKIES_EXPIRATION_DAY || 0, 'day')
      .unix()
      .toString();
    const curentDate = dayjs().unix().toString();
    const subDate = dayjs().subtract(7, 'day').unix().toString();
    const loginSession = await this.loginSessionRepository
      .createQueryBuilder('loginSession')
      .where('loginSession.userId = :userId AND loginSession.expired >= :curentDate', { curentDate, userId: userId })
      .innerJoin('loginSession.user', 'user')
      .getOne();
    if (loginSession) {
      await this.loginSessionRepository.update({ id: loginSession.id }, { expired: subDate });
    }
    const saveLoginSession = await this.loginSessionRepository
      .insert({
        expired: expiredDate,
        masterMediaId: masterMediaId,
        userId,
        status: 1
      })
      .then(v => v.generatedMaps[0]);
    const access = await this.masterAccessRepository.findOne({
      where: { id: accessId },
      select: ['code']
    });
    console.log('access', access);
    console.log('accessId', accessId);
    if (!access) {
      throw new BadRequestException('Invalid Access');
    }
    const token = await this.commonService.generateAuthToken({
      sessionId: `${saveLoginSession?.sessionId}`,
      accessId: access.code,
      appId
    });
    return token;
  }

  async register(param: RegisterDTO) {
    const dataSource = await this.projectDbConfigService.dbConnection();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { USER_ACCESS_ID } = await this.commonService.generalParameter();
      const { device, email, name, password, username } = param;
      let photo = param.photo;
      const existUser = await this.userRepository
        .createQueryBuilder('user')
        .select(['user.id'])
        .where('user.email = :email OR user.username = :username', {
          email,
          username
        })
        .setQueryRunner(queryRunner)
        .getOne();
      if (existUser) {
        throw new BadRequestException('username or email is Already exist');
      }
      photo = await this.commonService.base64ToFile(photo, '/user', `${username}${new Date().getTime()}.png`);
      const hashPassword = await this.commonService.bcrpytSign(password);
      const user = await this.userRepository
        .createQueryBuilder()
        .insert()
        .values({
          email,
          username,
          name,
          password: hashPassword,
          photo,
          is_premium: 0,
          status: 1
        })
        .setQueryRunner(queryRunner)
        .execute();
      await this.userAccessRepository
        .createQueryBuilder()
        .insert()
        .values({
          userId: user.identifiers[0].id,
          masterAccessId: USER_ACCESS_ID,
          status: 1
        })
        .setQueryRunner(queryRunner)
        .execute();
      await this._checkDevice(device, user.generatedMaps[0].id, queryRunner);
      await queryRunner.commitTransaction();
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

  private async _checkDevice(
    request: DeviceDto,
    userId: number,
    queryRunner: QueryRunner
  ): Promise<{ deviceId: number }> {
    const {
      imei,
      firebase_id,
      devicetype,
      language,
      manufacturer,
      model,
      os,
      osVersion,
      region,
      sdkVersion,
      heightdips,
      heightpixels,
      scale,
      widthdips,
      widthpixels,
      player_id
    } = request;

    let deviceId: any;
    if (imei) {
      const checkImei = await this.deviceRepository
        .createQueryBuilder()
        .where('imei = :imei', { imei })
        .setQueryRunner(queryRunner)
        .getOne();

      if (checkImei) {
        deviceId = checkImei;
        if (firebase_id != checkImei?.firebase_id) {
          await this.deviceRepository
            .createQueryBuilder()
            .update()
            .where('id = :id', { id: checkImei?.id })
            .set({ firebase_id })
            .setQueryRunner(queryRunner)
            .execute();
          return { deviceId };
        }
      }
      if (!checkImei) {
        const device = await this.deviceRepository
          .createQueryBuilder()
          .insert()
          .values({
            imei,
            firebase_id,
            devicetype,
            language,
            manufacturer,
            model,
            os,
            osVersion,
            region,
            sdkVersion,
            heightdips,
            heightpixels,
            scale,
            widthdips,
            widthpixels,
            player_id
          })
          .setQueryRunner(queryRunner)
          .execute();
        deviceId = device.generatedMaps[0];
      }
      const userDevice = await this.userDeviceRepository
        .createQueryBuilder()
        .where('"deviceId" = :deviceId AND "userId" = :userId', {
          deviceId: deviceId.id,
          userId
        })
        .setQueryRunner(queryRunner)
        .select('id')
        .getOne();
      if (!userDevice) {
        await this.userDeviceRepository
          .createQueryBuilder()
          .insert()
          .values({
            deviceId,
            userId: userId
          })
          .setQueryRunner(queryRunner)
          .execute();
      }
      return { deviceId };
    }
  }
}
