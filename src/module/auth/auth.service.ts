import { CommonService } from '@common/service/common.service';
import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDTO, RegisterDTO } from './auth.dto';
import * as dayjs from 'dayjs';
import { LoginSessionRepository } from 'src/db/project-db/entity/login-session/login-session.repository';
import { UserRepository } from 'src/db/project-db/entity/user/user.repository';
import { In } from 'typeorm';
import { UserJournalistRepository } from 'src/db/project-db/entity/user-journalist/user-journalist.repository';
import { MasterBankRepository } from 'src/db/project-db/entity/master-bank/master-bank.repository';
import { UserJournalist } from 'src/db/project-db/entity/user-journalist/user-journalist.entity';
import { AppConfigService } from '@common/config/api/config.service';
import { ProjectDbConfigService } from '@common/config/db/project-db/config.service';

@Injectable()
export class AuthService {
  constructor(
    private commonService: CommonService,
    private appConfig: AppConfigService,
    private projectDbConfigService: ProjectDbConfigService
  ) {}

  @InjectRepository(UserRepository)
  private userRepository: UserRepository;
  @InjectRepository(UserJournalistRepository)
  private userJournalistRepository: UserJournalistRepository;
  @InjectRepository(LoginSessionRepository)
  private loginSessionRepository: LoginSessionRepository;
  @InjectRepository(MasterBankRepository)
  private masterBankRepository: MasterBankRepository;

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
    const token = await this.commonService.generateAuthToken({
      sessionId: `${saveLoginSession?.sessionId}`,
      accessId,
      appId
    });
    return token;
  }

  async register(user: number, param: RegisterDTO, appId: number, files: Express.Multer.File[]) {
    const dataSource = await this.projectDbConfigService.dbConnection();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const {
        media_name,
        email,
        address,
        bankId,
        account_no,
        pers_card_no,
        npwp,
        instagram_link,
        facebook_link,
        x_link,
        tiktok_link,
        youtube_link,
        website_link,
        podcast_link
      } = param;

      // validate user
      const whatsapp_no = this.commonService.changePhone(param.whatsapp_no, '62');
      const existUser = await this._validateUser({ email, hp: whatsapp_no, no_pers: pers_card_no });
      if (existUser) {
        throw new BadRequestException('Alamat email ini sudah terdaftar. Silakan gunakan alamat email lain.');
      }

      // cleansing data

      // check master data
      const bankType = await this.masterBankRepository.findOne({ where: { id: bankId }, select: ['id'] });
      if (!bankType) {
        throw new BadRequestException('Invalid Bank Type');
      }

      // insert new user journalist
      const newUserJournalist = new UserJournalist();

      newUserJournalist.media_name = media_name;
      newUserJournalist.email = email;
      newUserJournalist.address = address;
      newUserJournalist.whatsapp_no = whatsapp_no;
      newUserJournalist.account_no = account_no?.toString();
      newUserJournalist.pers_card_no = pers_card_no;
      newUserJournalist.npwp = npwp;
      newUserJournalist.instagram_link = instagram_link || '';
      newUserJournalist.facebook_link = facebook_link || '';
      newUserJournalist.x_link = x_link || '';
      newUserJournalist.tiktok_link = tiktok_link || '';
      newUserJournalist.youtube_link = youtube_link || '';
      newUserJournalist.website_link = website_link || '';
      newUserJournalist.podcast_link = podcast_link || '';
      newUserJournalist.status = 0;

      const createNewJournalist = await queryRunner.manager
        .createQueryBuilder(UserJournalist, 'userJournalist')
        .insert()
        .values(newUserJournalist)
        .orUpdate(
          [
            'media_name',
            'whatsapp_no',
            'address',
            'account_no',
            'pers_card_no',
            'npwp',
            'instagram_link',
            'facebook_link',
            'x_link',
            'tiktok_link',
            'youtube_link',
            'website_link',
            'podcast_link',
            'status'
          ],
          ['email']
        )
        .execute();

      // user journalist certificate
      const file = [];
      for (let index = 0; index < files.length; index++) {
        const element = files[index];
        file.push(
          `(${createNewJournalist.identifiers[0].id}, '${
            this.appConfig.BASE_URL + '/journalist_doc/' + element.filename
          }', 'journalist_doc/${element.filename}', 1)`
        );
      }

      if (file.length > 0) {
        const syntax = `INSERT INTO "user_journalist_doc" ("userJournalistId", url, path, status) VALUES ${file.join(
          ','
        )}`;
        await queryRunner.manager.query(syntax, []);
      }
      await queryRunner.commitTransaction();
      return { message: 'registration success' };
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

  // async forgotPassword(){
  // const {email} = param
  // const userJournalist = await this.userJournalistRepository.findOne({where:{email},select:["status","id"]})
  // }

  private async _validateUser(params: { email: string; hp: string; no_pers: string }): Promise<number> {
    const email = params?.email?.toLowerCase() || '';
    const no_pers = params?.no_pers?.toLowerCase() || '';
    const hp = params?.hp?.toLowerCase() || '';

    // check email
    const checkUserJournalist = await this.userJournalistRepository.findOne({
      select: ['id', 'status'],
      where: [
        { whatsapp_no: hp, status: In([0, 1, 2]) },
        { email, status: In([0, 1, 2]) },
        { pers_card_no: no_pers, status: In([0, 1, 2]) }
      ]
    });
    return checkUserJournalist?.id;
  }
}
