import { CommonService } from '@common/service/common.service';
import { Process, Processor } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { UserAccessRepository } from 'src/db/project-db/entity/user-access/user-access.repository';
import { UserJournalistDocRepository } from 'src/db/project-db/entity/user-journalist-doc/user-journalist-doc.repository';
import { UserJournalistRepository } from 'src/db/project-db/entity/user-journalist/user-journalist.repository';
import { UserRepository } from 'src/db/project-db/entity/user/user.repository';
import { MasterService } from '../master/master.service';
import { MailerService } from '../mailer/mailer.service';
import { JournalistVerificationCodeRepository } from 'src/db/project-db/entity/journalist-verification-code/journalist-verification-code.repository';
import { JournalistVerificationCode } from 'src/db/project-db/entity/journalist-verification-code/journalist-verification-code.entity';
import { QueryRunner } from 'typeorm';
import { ProjectDbConfigService } from '@common/config/db/project-db/config.service';
import { ProcessApprovedMediaDTO } from './media.dto';
import { UserJournalistHistoryRepository } from 'src/db/project-db/entity/user-journalist-history/user-journalist-history.repository';
import * as dayJs from 'dayjs';

@Processor('approved-simaspro')
export class ApprovedSimaspro {
  constructor(
    private commonService: CommonService,
    private masterService: MasterService,
    private mailerService: MailerService,
    private projectDbConfigService: ProjectDbConfigService
  ) {}
  @InjectRepository(UserJournalistRepository) private userJournalistRepository: UserJournalistRepository;
  @InjectRepository(UserJournalistDocRepository) private userJournalistDocRepository: UserJournalistDocRepository;
  @InjectRepository(UserJournalistHistoryRepository)
  private userJournalistHistoryRepository: UserJournalistHistoryRepository;
  @InjectRepository(UserRepository) private userRepository: UserRepository;
  @InjectRepository(UserAccessRepository) private userAccessRepository: UserAccessRepository;
  @InjectRepository(JournalistVerificationCodeRepository)
  private journalistVerificationCodeRepository: JournalistVerificationCodeRepository;

  @Process()
  async processApprovedSimaspro(job: Job<ProcessApprovedMediaDTO>) {
    const { USER_ACCESS_ID, USER_APP_ID } = await this.commonService.generalParameter();
    const { status, mediaName, userJournalId, reasonName, userJournalEmail, userId, reasonId } = job.data;
    const dataSource = await this.projectDbConfigService.dbConnection();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (status == 1) {
        // approved
        let journalistId = '';
        let isUnique = true;
        while (isUnique) {
          journalistId = (await this.commonService.randString(8, '34679QWERTYUPADFGHJKLXCVNM', ``))?.toLowerCase();
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
            name: mediaName,
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
          .where('id = :id', { id: userJournalId })
          .set({ status: 2, journalist_id: journalistId, userId: user.identifiers[0].id, approvedById: userId })
          .setQueryRunner(queryRunner)
          .execute();
        const generatedVoucher = await this._generateVerificationCode(userJournalId, 50, queryRunner);
        // send email
        await this._sendMail([journalistId, password, generatedVoucher], 1, userJournalEmail, user.identifiers[0].id);
      }

      if (status == 2) {
        // rejected
        await this.userJournalistRepository.update(
          { id: userJournalId },
          { status: 3, masterInvalidReasonId: reasonId }
        );
        await this.userJournalistDocRepository
          .createQueryBuilder()
          .update()
          .where('"userJournalistId" = :id', { id: userJournalId })
          .set({ status: 0 })
          .setQueryRunner(queryRunner)
          .execute();
        // send email
        await this._sendMail([reasonName], 2, userJournalEmail, 0);
      }
      await this.userJournalistHistoryRepository
        .createQueryBuilder()
        .insert()
        .values({
          approved_at: dayJs().format('YYYY-MM-DD HH:mm:ss'),
          approvedById: userId,
          createdById: userId,
          status,
          userJournalistId: userJournalId
        });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error.stack);
    } finally {
      await queryRunner.release();
    }
  }
  private async _sendMail(params: string[], status: number, email: string, userId: number) {
    const scriptObj = await this.masterService
      .script()
      .then(v => (status == 1 ? v.journalistRegApproved : status == 2 ? v.journalistRegReject : null));
    params.map((v, idx) => {
      scriptObj.body = scriptObj.body.replace(`{{${idx + 1}}}`, v);
    });
    await this.mailerService.sendMail({
      email: email,
      subject: scriptObj.title,
      userId,
      text: scriptObj.body
    });
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
}
