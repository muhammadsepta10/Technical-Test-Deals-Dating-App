import { CommonService } from '@common/service/common.service';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDTO, RegisterDTO } from './auth.dto';
import * as dayjs from 'dayjs';
import { LoginSessionRepository } from 'src/db/project-db/entity/login-session/login-session.repository';
import { UserRepository } from 'src/db/project-db/entity/user/user.repository';
import { EntityManager } from 'typeorm';
import { UserJournalistRepository } from 'src/db/project-db/entity/user-journalist/user-journalist.repository';
import { MasterBankRepository } from 'src/db/project-db/entity/master-bank/master-bank.repository';
import { UserJournalist } from 'src/db/project-db/entity/user-journalist/user-journalist.entity';
import { AppConfigService } from '@common/config/api/config.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly entityManager: EntityManager,
    private commonService: CommonService,
    private appConfig: AppConfigService
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
    const { password, journalist_id } = param;
    const user = await this.userRepository.findUserLogin(journalist_id);
    if (!user) {
      throw new BadRequestException('Media ID tidak terdaftar. Mohon lakukan registrasi terlebih dahulu.');
    }
    const { status, id, hashPassword, accessId, appId } = user;
    if (status === 2) {
      throw new ForbiddenException('Data anda masih proses Verifikasi');
    }
    if (status === 0) {
      throw new BadRequestException('User Di non-aktifkan');
    }
    const comparePassword = await this.commonService.bcrpytCompare(password, hashPassword);
    if (!comparePassword) {
      throw new BadRequestException('Password anda tidak sesuai. Mohon isi dengan benar.');
    }
    const token = await this._genToken(id, accessId, appId);
    return { token, message: 'Succes login' };
  }

  private async _genToken(userId: number, accessId?: string, appId?: number, masterMediaId?: number) {
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
    this.entityManager
      .transaction(async transactionalEntityManager => {
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
        const existUser = await this._validateUser({ email });
        if (existUser) {
          throw new BadRequestException('Alamat email ini sudah terdaftar. Silakan gunakan alamat email lain.');
        }

        // cleansing data
        const whatsapp_no = this.commonService.changePhone(param.whatsapp_no, '62');

        // check master data
        const bankType = await this.masterBankRepository.findOne({ where: { id: bankId }, select: ['id'] });
        if (!bankType) {
          throw new BadRequestException('Invalid Bank Type');
        }

        // insert new user journalist
        const newUserJournalist = new UserJournalist();

        newUserJournalist.media_name = media_name;
        newUserJournalist.email = media_name;
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

        const createNewJournalist = await transactionalEntityManager.save(UserJournalist, newUserJournalist);

        // user journalist certificate
        const file = [];
        for (let index = 0; index < files.length; index++) {
          const element = files[index];
          file.push(
            `(${createNewJournalist.id}, '${
              this.appConfig.BASE_URL + '/journalist_doc/' + element.filename
            }', 'journalist_doc/${element.filename}', 1, ${user})`
          );
        }

        if (file.length > 0) {
          const syntax = `INSERT INTO "user_journalist_doc" ("userJournalistId", url, path, status, "createdById") VALUES ${file.join(
            ','
          )}`;
          await transactionalEntityManager.query(syntax, []);
        }
        return { message: 'registration success' };
      })
      .catch(error => {
        if (!error?.response || !error?.status) {
          throw new InternalServerErrorException(error);
        }
        throw new HttpException(error?.response, error?.status);
      });
    // try {
    //     // master data and parameter
    //     let {documents,
    //         vendorAddress,
    //         vendorEmail,
    //         vendorNIB,
    //         vendorName,
    //         vendorNpwp,
    //         vendorOwner,
    //         vendorOwnerPhone,
    //         vendorPassword,
    //         vendorPhone,
    //         vendorType,
    //         vendorVillage,
    //         type,
    //         vendorAdminPhone,
    //         vendorHistory,
    //         vendorKBLI,
    //         device} = param

    //     vendorKBLI = typeof vendorKBLI == "string" ? JSON.parse(vendorKBLI) : vendorKBLI
    //     documents = documents.map((v: any) => JSON.parse(v))
    //     // documents = !documents ? [] : JSON.parse(`${documents}`)
    //     documents = this.commonService.refactorFiles(files, documents)
    //     // validate user
    //     const existVendorId = await this._validateUser({email: vendorEmail, nib: vendorNIB, npwp: vendorNpwp})
    //     const hashPassword = await this.commonService.bcrpytSign(vendorPassword)
    //     let user = await this.userRepository.findOne({where: {username: vendorEmail}, select: ["id"]})
    //     if (!user) {
    //         user = await queryRunner.manager.insert(User, {
    //             password: hashPassword,
    //             status: 1,
    //             username: vendorEmail,
    //             name: vendorName
    //         }).then((v: any) => v.generatedMaps[0])
    //     }
    //     const {id: userId} = user
    //     await this._saveAccess({userId, type}, queryRunner)
    //     // cleansing data
    //     vendorPhone = this.commonService.changePhone(vendorPhone, "62")
    //     vendorAdminPhone = this.commonService.changePhone(vendorAdminPhone, "62")
    //     vendorOwnerPhone = this.commonService.changePhone(vendorOwnerPhone, "62")
    //     vendorType = +vendorType || 0
    //     vendorVillage = +vendorVillage || 0

    //     // check master data
    //     const officeType = await this.masterOfficeCategoryRepository.findOne({where: {id: vendorType}, select: ["id"]})
    //     if (!officeType) {
    //         throw new BadRequestException("Invalid Vendor Type")
    //     }
    //     const area = await this.masterUrbanVillageRepository.createQueryBuilder("village")
    //         .innerJoin("village.masterSubDistrict", "district")
    //         .innerJoin("district.city", "city")
    //         .innerJoin("city.province", "province")
    //         .select("village.id", "villageId")
    //         .addSelect("district.id", "districtId")
    //         .addSelect("city.id", "cityId")
    //         .addSelect("province.id", "provinceId")
    //         .where("village.id = :villageId", {villageId: vendorVillage})
    //         .getRawOne()
    //     if (!area) {
    //         throw new BadRequestException("Invalid Area")
    //     }
    //     let {villageId, districtId, cityId, provinceId} = area

    //     // validate documents
    //     const vendorHead = await queryRunner.manager.insert(VendorHead, {name: vendorOwner, phone_number: vendorOwnerPhone}).then(v => v.generatedMaps[0])
    //     let vendor: Vendor = null
    //     if (existVendorId) {
    //         vendor = await this.vendorRepository.createQueryBuilder("vendor")
    //             .update()
    //             .setQueryRunner(queryRunner)
    //             .set({
    //                 address: vendorAddress,
    //                 email: vendorEmail,
    //                 nib: vendorNIB,
    //                 name: vendorName,
    //                 npwp: vendorNpwp,
    //                 masterOfficeCategoryId: vendorType,
    //                 masterCityId: cityId,
    //                 masterProvinceId: provinceId,
    //                 masterSubDistrictId: districtId,
    //                 masterUrbanVillageId: villageId,
    //                 phone_number: vendorPhone,
    //                 vendorHead,
    //                 userId,
    //                 status: 0,
    //                 admin_phone_number: vendorAdminPhone,
    //                 history: vendorHistory,
    //                 // masterKbliId: vendorKBLI,
    //                 type
    //             })
    //             .where("id = :vendorId", {vendorId: existVendorId})
    //             .returning(["id"])
    //             .execute()
    //             .then((v: any) => {
    //                 return v.raw[0]
    //             })
    //     }
    //     if (!existVendorId) {
    //         vendor = await queryRunner.manager.insert(Vendor, {
    //             address: vendorAddress,
    //             email: vendorEmail,
    //             nib: vendorNIB,
    //             name: vendorName,
    //             npwp: vendorNpwp,
    //             masterOfficeCategoryId: vendorType,
    //             masterCityId: cityId,
    //             masterProvinceId: provinceId,
    //             masterSubDistrictId: districtId,
    //             masterUrbanVillageId: villageId,
    //             phone_number: vendorPhone,
    //             vendorHead,
    //             userId,
    //             status: 0,
    //             admin_phone_number: vendorAdminPhone,
    //             history: vendorHistory,
    //             // masterKbliId: vendorKBLI,
    //             type
    //         }).then((v: any) => v.generatedMaps[0])
    //     }
    //     for (let index = 0; index < vendorKBLI.length; index++) {
    //         const kbliId = vendorKBLI[index];
    //         await queryRunner.manager.insert(VendorKbli, {
    //             masterKbliId: kbliId,
    //             vendorId: vendor.id,
    //             status: 0
    //         })

    //     }
    //     const documentsValidate = await this._checkDocument(documents, `/vendor/${vendorNIB}`, type === 1 ? 2 : 5, "multer")
    //     // save documents
    //     for (let index = 0; index < documentsValidate.length; index++) {
    //         const {id, url, name} = documentsValidate[index];
    //         await queryRunner.manager.insert(DocumentVendor, {
    //             masterDocumentCategoryId: id,
    //             vendorId: vendor.id,
    //             url,
    //             status: 0,
    //             name,
    //             createdById: userId
    //         })
    //     }
    //     await queryRunner.manager.insert(VendorHistory, {
    //         vendorId: vendor?.id,
    //         status: 0,
    //         masterReasonId: null
    //     })
    //     await queryRunner.commitTransaction()
    //     await this.gatewayService.notifEmail({
    //         email: vendorEmail,
    //         receiverName: vendorName,
    //         scriptName: "vendorRegSuccess",
    //         params: [moment().format("DD/MM/YYYY HH:mm:ss")],
    //         userId: userId
    //     })
    //     return {message: "registration success"}
    // } catch (error) {
    //     await queryRunner.rollbackTransaction();
    //     if (!error?.response || !error?.status) {
    //         throw new InternalServerErrorException(error);
    //     }
    //     throw new HttpException(error?.response, error?.status);
    // } finally {
    //     await queryRunner.release()
    // }
  }

  // private async _saveAccess(params: {userId: number, type: number}, queryRunner: QueryRunner) {
  //     let {type, userId} = params
  //     const accessIds = await this._accessByType(type)
  //     for (let index = 0; index < accessIds.length; index++) {
  //         const {accessId, appId} = accessIds[index]
  //         const userAccess = await this.userAccessRepository.exist({where: {masterAccessId: accessId, masterAppId: appId, userId}})
  //         if (!userAccess) {
  //             await queryRunner.manager.insert(UserAccess, {
  //                 masterAccessId: accessId,
  //                 masterAppId: appId,
  //                 userId,
  //                 status: 1
  //             })
  //         }
  //     }

  // }

  // private async _validateAccess(userId: number, type) {
  //     const access = this._accessByType(type).map(v => v.accessId)
  //     const userAccess = await this.userAccessRepository.find({where: {id: userId, masterAccessId: In(access)}, select: ["id"]})
  //     return userAccess.length < 1 ? false : true
  // }

  private async _validateUser(params: { email: string }): Promise<number> {
    const email = params?.email?.toLowerCase() || '';

    // check email
    const checkUserJournalist = await this.userJournalistRepository.findOne({
      select: ['id', 'status'],
      where: [{ email }]
    });
    if (checkUserJournalist) {
      if (email === checkUserJournalist.email) {
        throw new BadRequestException('Email Already Exist');
      }
    }
    return checkUserJournalist?.id;
  }
}
