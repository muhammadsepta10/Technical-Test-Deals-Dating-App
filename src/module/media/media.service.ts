import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ApproveMediaDTO, ApproveNewsDTO, ListMediaDTO, ProcessApprovedMediaDTO, SubmitNewsDTO } from './media.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserJournalistRepository } from 'src/db/project-db/entity/user-journalist/user-journalist.repository';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MasterInvalidReasonRepository } from 'src/db/project-db/entity/master-invalid-reason/master-invalid-reason.repository';
import { NewsVerificationRepository } from 'src/db/project-db/entity/news-verification/news-verification.repository';
import { ProjectDbConfigService } from '@common/config/db/project-db/config.service';
import { AppConfigService } from '@common/config/api/config.service';
import { MasterNewsCategoryRepository } from 'src/db/project-db/entity/master-news-category/master-news-category.repository';
import { JournalistVerificationCodeRepository } from 'src/db/project-db/entity/journalist-verification-code/journalist-verification-code.repository';
import * as dayjs from 'dayjs';
import { NewsVerificationDocRepository } from 'src/db/project-db/entity/news-verification-doc/news-verification-doc.repository';
import { MasterService } from '../master/master.service';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class MediaService {
  constructor(
    @InjectQueue('approved-simaspro') private approvedMediaQueue: Queue<ProcessApprovedMediaDTO>,
    private projectDbConfigService: ProjectDbConfigService,
    private appConfigService: AppConfigService,
    private masterService: MasterService,
    private mailerService: MailerService
  ) {}
  @InjectRepository(UserJournalistRepository) private userJournalistRepository: UserJournalistRepository;
  @InjectRepository(MasterInvalidReasonRepository) private masterInvalidReasonRepository: MasterInvalidReasonRepository;
  @InjectRepository(NewsVerificationRepository) private newsVerificationRepository: NewsVerificationRepository;
  @InjectRepository(NewsVerificationDocRepository) private newsVerificationDocRepository: NewsVerificationDocRepository;
  @InjectRepository(MasterNewsCategoryRepository) private masterNewsCategoryRepository: MasterNewsCategoryRepository;
  @InjectRepository(JournalistVerificationCodeRepository)
  private journalistVerificationCodeRepository: JournalistVerificationCodeRepository;

  async listMedia(param: ListMediaDTO) {
    param.page = param.page >= 1 ? param.page - 1 : param.page;
    const currentPage = param.page <= 1 ? 1 : param.page + 1;
    const data = await this.userJournalistRepository.listJournalist(param);
    const totalData = await this.userJournalistRepository.countData(param);
    const totalPage = Math.ceil(totalData / param.limit);
    return {
      totalData,
      totalPage,
      currentPage,
      raw: data
    };
  }

  async approveMedia(param: ApproveMediaDTO, userId: number) {
    const { mediaId, reasonId, status } = param;
    const userJournal = await this.userJournalistRepository.findOne({
      where: { uuid: mediaId },
      select: ['id', 'status', 'media_name', 'email']
    });
    if (!userJournal) {
      throw new BadRequestException('Invalid Media');
    }
    if (userJournal?.status != 0) {
      throw new BadRequestException('Already Approved');
    }
    if (![1, 2].includes(status)) {
      throw new BadRequestException('Invalid Status');
    }
    if (status === 1) {
      await this.approvedMediaQueue.add({
        mediaName: userJournal?.media_name,
        reasonName: '',
        status,
        userId,
        userJournalEmail: userJournal?.email,
        userJournalId: userJournal?.id,
        reasonId: 0
      });
    }
    if (status === 2) {
      const checkReason = await this.masterInvalidReasonRepository.findOne({
        where: { id: reasonId },
        select: ['id', 'name']
      });
      if (!checkReason) {
        throw new BadRequestException('ReasonId Not Valid');
      }
      await this.approvedMediaQueue.add({
        mediaName: userJournal?.media_name,
        reasonName: checkReason?.name,
        status,
        userId,
        userJournalEmail: userJournal?.email,
        userJournalId: userJournal?.id,
        reasonId
      });
    }
  }

  async approveNews(param: ApproveNewsDTO, userId: number) {
    const dataSource = await this.projectDbConfigService.dbConnection();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { newsId, reasonId, status } = param;
      const newsVerification = await this.newsVerificationRepository
        .createQueryBuilder('newsVerification')
        .innerJoinAndSelect('newsVerification.userJournalist', 'userJournalist')
        .where('newsVerification.uuid = :newsId', { newsId })
        .select([
          'newsVerification.id',
          'newsVerification.status',
          'newsVerification.title',
          'userJournalist.id',
          'userJournalist.status',
          'userJournalist.email',
          'userJournalist.userId'
        ])
        .getOne();
      if (!newsVerification) {
        throw new BadRequestException('Invalid News');
      }
      if (newsVerification.status != 0) {
        throw new BadRequestException('Already Approved');
      }
      const mailParams = [];

      if (status === 1) {
        // approved
        const updated = await this.newsVerificationRepository
          .createQueryBuilder()
          .update()
          .set({ status: 1, approvedById: userId, approved_at: dayjs().format('YYYY-MM-DD HH:m:ss') })
          .where('id = :id AND status = 0', { id: newsVerification.id })
          .setQueryRunner(queryRunner)
          .execute();
        if (updated.affected < 1) {
          throw new BadRequestException('Already Approved');
        }
      }
      if (status === 2) {
        // rejected
        const reason = await this.masterInvalidReasonRepository.findOne({ where: { id: reasonId }, select: ['name'] });
        if (!reason) {
          throw new BadRequestException('Reason Is Not valid');
        }
        const updated = await this.newsVerificationRepository
          .createQueryBuilder()
          .update()
          .set({
            status: 2,
            approvedById: userId,
            approved_at: dayjs().format('YYYY-MM-DD HH:m:ss'),
            masterInvalidReasonId: reasonId
          })
          .where('id = :id AND status = 0', { id: newsVerification.id })
          .setQueryRunner(queryRunner)
          .execute();
        if (updated.affected < 1) {
          throw new BadRequestException('Already Approved');
        }
        mailParams.push(reason.name);
      }
      // send email
      await this._sendMail(
        mailParams,
        status,
        newsVerification.userJournalist.email,
        newsVerification.userJournalist.userId
      );
      await queryRunner.commitTransaction();
      return { message: 'Success Approve News' };
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

  private async _sendMail(params: string[], status: number, email: string, userId: number) {
    const scriptObj = await this.masterService
      .script()
      .then(v => (status == 1 ? v.newsApproved : status == 2 ? v.newsReject : null));
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

  async listNews(param: ListMediaDTO) {
    param.page = param.page >= 1 ? param.page - 1 : param.page;
    const currentPage = param.page <= 1 ? 1 : param.page + 1;
    const data = await this.newsVerificationRepository.list(param);
    const totalData = await this.newsVerificationRepository.countData(param);
    const totalPage = Math.ceil(totalData / param.limit);
    return {
      totalData,
      totalPage,
      currentPage,
      raw: data
    };
  }

  async detailNews(id: string) {
    return this.newsVerificationRepository.detail(id);
  }

  async submitNews(param: SubmitNewsDTO, files: Express.Multer.File[], userId: number) {
    const dataSource = await this.projectDbConfigService.dbConnection();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const userJournalist = await this.userJournalistRepository.findOne({ where: { userId }, select: ['id'] });
      if (!userJournalist) {
        throw new BadRequestException('Invalid User');
      }
      const { categoryId, desc, title, url } = param;
      const category = await this.masterNewsCategoryRepository.findOne({ where: { id: categoryId }, select: ['id'] });
      // const checkVerif = await this.journalistVerificationCodeRepository
      //   .createQueryBuilder()
      //   .where('verification_code = :verificationNo AND status = 0', { verificationNo: verificationNo.toUpperCase() })
      //   .update()
      //   .set({
      //     status: 1,
      //     used_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
      //   })
      //   .returning(['id'])
      //   .setQueryRunner(queryRunner)
      //   .execute();
      // if (checkVerif.affected < 1) {
      //   throw new BadRequestException('Invalid Verif code');
      // }
      if (!category) {
        throw new BadRequestException('Invalid Category');
      }
      const newsVerification = await this.newsVerificationRepository
        .createQueryBuilder()
        .insert()
        .values({
          desc,
          title,
          url,
          masterNewsCategoryId: categoryId,
          // journalistVerificationCodeId: checkVerif.raw[0].id,
          userJournalistId: userJournalist.id
        })
        .setQueryRunner(queryRunner)
        .execute();
      for (let index = 0; index < files.length; index++) {
        const { filename } = files[index];
        const path = `news_doc/${filename}`;
        const urlFile = `${this.appConfigService.BASE_URL}/${path}`;
        await this.newsVerificationDocRepository
          .createQueryBuilder()
          .insert()
          .values({
            newsVerificationId: newsVerification.generatedMaps[0].id,
            path,
            url: urlFile,
            status: 1,
            createdById: userId
          })
          .setQueryRunner(queryRunner)
          .execute();
      }
      await queryRunner.commitTransaction();
      return { message: 'Berhasil Submit Berita' };
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

  async detailMedia(id: string) {
    return this.userJournalistRepository.detail(id);
  }
}
