import { CommonService } from '@common/service/common.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDTO } from './auth.dto';
import * as dayjs from 'dayjs';
import { LoginSessionRepository } from 'src/db/project-db/entity/login-session/login-session.repository';
import { UserRepository } from 'src/db/project-db/entity/user/user.repository';
import { MasterAccessRepository } from 'src/db/project-db/entity/master-access/master-access.repository';
import { ProjectDbConfigService } from '@common/config/db/project-db/config.service';

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

  async login(param: LoginDTO) {
    const { password, username } = param;
    const user = await this.userRepository.findUserLogin(username);
    if (!user) {
      throw new BadRequestException('User tidak terdaftar');
    }
    const { status, id, hashPassword, accessId, appId } = user;
    if (status != 1) {
      throw new BadRequestException('User Tidak Aktif');
    }
    const comparePassword = await this.commonService.bcrpytCompare(password, hashPassword);
    if (!comparePassword) {
      throw new BadRequestException('Password anda tidak sesuai. Mohon isi dengan benar.');
    }
    const token = await this._genToken(id, accessId, appId);
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
}
