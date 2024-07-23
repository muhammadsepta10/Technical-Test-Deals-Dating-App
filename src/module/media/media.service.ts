import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ApproveMediaDTO, ListMediaDTO } from './media.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserJournalistRepository } from 'src/db/project-db/entity/user-journalist/user-journalist.repository';
import { CommonService } from '@common/service/common.service';
import * as dayjs from 'dayjs';
import { UserRepository } from 'src/db/project-db/entity/user/user.repository';
import { UserAccessRepository } from 'src/db/project-db/entity/user-access/user-access.repository';
import { MasterInvalidReasonRepository } from 'src/db/project-db/entity/master-invalid-reason/master-invalid-reason.repository';
import { UserJournalistDocRepository } from 'src/db/project-db/entity/user-journalist-doc/user-journalist-doc.repository';
import { JournalistVerificationCodeRepository } from 'src/db/project-db/entity/journalist-verification-code/journalist-verification-code.repository';
import { QueryRunner } from 'typeorm';
import { ProjectDbConfigService } from '@common/config/db/project-db/config.service';
import { JournalistVerificationCode } from 'src/db/project-db/entity/journalist-verification-code/journalist-verification-code.entity';

@Injectable()
export class MediaService {
  constructor(
    private commonService: CommonService,
    private projectDbConfigService: ProjectDbConfigService
  ) {}
  @InjectRepository(UserJournalistRepository) private userJournalistRepository: UserJournalistRepository;
  @InjectRepository(UserJournalistDocRepository) private userJournalistDocRepository: UserJournalistDocRepository;
  @InjectRepository(UserRepository) private userRepository: UserRepository;
  @InjectRepository(UserAccessRepository) private userAccessRepository: UserAccessRepository;
  @InjectRepository(MasterInvalidReasonRepository) private masterInvalidReasonRepository: MasterInvalidReasonRepository;
  @InjectRepository(JournalistVerificationCodeRepository)
  private journalistVerificationCodeRepository: JournalistVerificationCodeRepository;

  async listMedia(param: ListMediaDTO) {
    const data = await this.userJournalistRepository.listJournalist(param);
    return data;
  }

  private async _generateVerificationCode(journalistId: number, cnt: number, queryRunner: QueryRunner) {
    let generated = 0;
    let verificationCodes = '';
    while (generated < cnt) {
      const code = await this.commonService.randString(10, '34679QWERTYUPADFGHJKLXCVNM', '');
      const check = await queryRunner.manager.findOne(JournalistVerificationCode, {
        where: { verification_code: code },
        select: ['id']
      });
      if (!check) {
        await this.journalistVerificationCodeRepository
          .createQueryBuilder()
          .insert()
          .values({ verification_code: code, status: 0, userJournalistId: journalistId })
          .setQueryRunner(queryRunner)
          .execute()
          .then(() => {
            generated++;
            verificationCodes += `${code}\n`;
          })
          .catch(() => {});
      }
    }
    return verificationCodes;
  }

  async approveMedia(param: ApproveMediaDTO, userId: number) {
    const dataSource = await this.projectDbConfigService.dbConnection();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { mediaId, reasonId, status } = param;
      const { USER_ACCESS_ID, USER_APP_ID } = await this.commonService.generalParameter();
      const userJournal = await this.userJournalistRepository.findOne({
        where: { uuid: mediaId },
        select: ['id', 'status', 'media_name']
      });
      if (!userJournal) {
        throw new BadRequestException('Invalid Media');
      }
      if (userJournal?.status != 0) {
        throw new BadRequestException('Already verify');
      }
      if (status == 1) {
        // approved
        let journalistId = '';
        let isUnique = true;
        while (isUnique) {
          journalistId = (
            await this.commonService.randString(5, '34679QWERTYUPADFGHJKLXCVNM', `${dayjs().unix()}`)
          )?.toLowerCase();
          const existJournalId = await this.userJournalistRepository.findOne({
            where: { journalist_id: journalistId },
            select: ['id']
          });
          if (!existJournalId) {
            isUnique = false;
          }
        }
        const password = await this.commonService.randString(8, '34679QWERTYUPADFGHJKLXCVNM', '');
        const hashPassword = await this.commonService.bcrpytSign(password);
        const user = await this.userRepository
          .createQueryBuilder()
          .insert()
          .values({
            name: userJournal?.media_name,
            username: journalistId,
            password: hashPassword
          })
          .setQueryRunner(queryRunner)
          .execute();
        await this.userAccessRepository
          .createQueryBuilder()
          .insert()
          .values({
            userId: user.identifiers[0].id,
            masterAccessId: USER_ACCESS_ID,
            masterAppId: USER_APP_ID
          })
          .setQueryRunner(queryRunner)
          .execute();
        await this.userJournalistRepository
          .createQueryBuilder()
          .update()
          .where('id = :id', { id: userJournal.id })
          .set({ status: 2, journalist_id: journalistId, userId: user.identifiers[0].id, approvedById: userId })
          .setQueryRunner(queryRunner)
          .execute();
        // send email
        // ..........
      }
      if (status == 2) {
        // rejected
        const reason = await this.masterInvalidReasonRepository.findOne({
          where: { status: 1, id: reasonId },
          select: ['id']
        });
        if (!reason) {
          throw new BadRequestException('Invalid Reason');
        }
        await this.userJournalistRepository.update(
          { id: userJournal.id },
          { status: 3, masterInvalidReasonId: reasonId }
        );
        await this.userJournalistDocRepository
          .createQueryBuilder()
          .update()
          .where('"userJournalistId" = :id', { id: userJournal.id })
          .set({ status: 0 })
          .setQueryRunner(queryRunner)
          .execute();
        // send email
        //   ...........
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      console.log('error', error);
      await queryRunner.rollbackTransaction();
      if (!error?.response || !error?.status) {
        throw new InternalServerErrorException(error);
      }
      throw new HttpException(error?.response, error?.status);
    } finally {
      await queryRunner.release();
    }
  }

  async detailMedia(id: string) {
    return this.userJournalistRepository.detail(id);
  }
}
