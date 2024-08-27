import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  ApproveMediaDTO,
  ApproveNewsDTO,
  ListMediaDTO,
  NewsItemsDTO,
  ProcessApprovedMediaDTO,
  SubmitNewsDTO
} from './media.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserJournalistRepository } from 'src/db/project-db/entity/user-journalist/user-journalist.repository';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MasterInvalidReasonRepository } from 'src/db/project-db/entity/master-invalid-reason/master-invalid-reason.repository';
import { NewsVerificationRepository } from 'src/db/project-db/entity/news-verification/news-verification.repository';
import { ProjectDbConfigService } from '@common/config/db/project-db/config.service';
import { AppConfigService } from '@common/config/api/config.service';
import { MasterNewsCategoryRepository } from 'src/db/project-db/entity/master-news-category/master-news-category.repository';
import * as dayjs from 'dayjs';
import { NewsVerificationDocRepository } from 'src/db/project-db/entity/news-verification-doc/news-verification-doc.repository';
import { MasterService } from '../master/master.service';
import { MailerService } from '../mailer/mailer.service';
import { NewsInvoiceRepository } from 'src/db/project-db/entity/news-invoice/news-invoice.repository';
import { CommonService } from '@common/service/common.service';
import { InvoiceRepository } from 'src/db/project-db/entity/invoice/invoice.repository';
import { QueryRunner } from 'typeorm';

@Injectable()
export class MediaService {
  constructor(
    @InjectQueue('approved-simaspro')
    private approvedMediaQueue: Queue<ProcessApprovedMediaDTO>,
    private projectDbConfigService: ProjectDbConfigService,
    private appConfigService: AppConfigService,
    private masterService: MasterService,
    private mailerService: MailerService,
    private commonService: CommonService
  ) {}
  @InjectRepository(UserJournalistRepository)
  private userJournalistRepository: UserJournalistRepository;
  @InjectRepository(MasterInvalidReasonRepository)
  private masterInvalidReasonRepository: MasterInvalidReasonRepository;
  @InjectRepository(NewsVerificationRepository)
  private newsVerificationRepository: NewsVerificationRepository;
  @InjectRepository(NewsVerificationDocRepository)
  private newsVerificationDocRepository: NewsVerificationDocRepository;
  @InjectRepository(MasterNewsCategoryRepository)
  private masterNewsCategoryRepository: MasterNewsCategoryRepository;
  @InjectRepository(NewsInvoiceRepository)
  private newsInvoiceRepository: NewsInvoiceRepository;
  @InjectRepository(InvoiceRepository)
  private invoiceRepository: InvoiceRepository;

  async listMedia(param: ListMediaDTO) {
    param.page = param.page >= 1 ? param.page - 1 : param.page;
    const currentPage = param.page < 1 ? 1 : param.page + 1;
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
      select: ['id', 'status', 'media_name', 'email', 'sortId', 'created_at']
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
        reasonId: 0,
        createdTime: userJournal?.created_at,
        sortId: userJournal?.sortId
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
        reasonId,
        createdTime: userJournal?.created_at,
        sortId: userJournal?.sortId
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
          .set({
            status: 1,
            approvedById: userId,
            approved_at: dayjs().format('YYYY-MM-DD HH:m:ss')
          })
          .where('id = :id AND status = 0', { id: newsVerification.id })
          .setQueryRunner(queryRunner)
          .execute();
        if (updated.affected < 1) {
          throw new BadRequestException('Already Approved');
        }
      }
      if (status === 2) {
        // rejected
        const reason = await this.masterInvalidReasonRepository.findOne({
          where: { id: reasonId },
          select: ['name']
        });
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

  async getListInvoice(userId: number, role: string) {
    const roleActions = {
      admin: this._listInvoiceAdmin.bind(this),
      journalist: this._listInvoiceUser.bind(this)
    };
    const byStatus = roleActions[role](userId);
    return byStatus;
  }

  private async _listInvoiceUser(userId: number) {
    const invoice = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .innerJoinAndSelect('invoice.items', 'items')
      .innerJoin('items.newsVerification', 'newsVerification')
      .innerJoin('newsVerification.userJournalist', 'userJournalist')
      .where('userJournalist.userId = :userId', { userId })
      .select(['invoice.invoice_no', 'invoice.uuid', 'invoice.from_name', 'invoice.date', 'invoice.grand_total'])
      .getMany()
      .then(v =>
        v.map(items => {
          return {
            invoiceNo: items.invoice_no,
            id: items.uuid,
            media: items.from_name,
            date: items.date,
            grandTotal: items.grand_total
          };
        })
      );
    return invoice;
  }

  private async _listInvoiceAdmin() {
    // userId = +userId || 0;
    const invoice = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .innerJoinAndSelect('invoice.items', 'items')
      .innerJoin('items.newsVerification', 'newsVerification')
      .innerJoin('newsVerification.userJournalist', 'userJournalist')
      .select(['invoice.invoice_no', 'invoice.uuid', 'invoice.from_name', 'invoice.date', 'invoice.grand_total'])
      .getMany()
      .then(v =>
        v.map(items => {
          return {
            invoiceNo: items.invoice_no,
            id: items.uuid,
            media: items.from_name,
            date: items.date,
            grandTotal: items.grand_total
          };
        })
      );
    return invoice;
  }

  async generateInvoice(params: NewsItemsDTO[], userId: number) {
    const { INVOICE_DUEDATE, INVOICE_TAX, INVOICE_TARGET_NAME, INVOICE_TARGET_ADDRESS } =
      await this.commonService.generalParameter();
    const { invoice: invoiceTemplate } = await this.masterService.script();
    let { html_template } = invoiceTemplate;
    const dataSource = await this.projectDbConfigService.dbConnection();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const currentDate = dayjs().locale('ID').format('DD MMMM YYYY');
      const duedate = dayjs().add(INVOICE_DUEDATE, 'day').locale('ID').format('DD MMMM YYYY');
      const invoice = await this.invoiceRepository
        .createQueryBuilder('invoice')
        .insert()
        .values({
          date: currentDate,
          due_date: duedate,
          generatedById: userId
        })
        .returning(['id'])
        .setQueryRunner(queryRunner)
        .execute();
      const invoiceId = invoice.raw[0].id;
      const {
        html: itemHtml,
        userJournalId,
        subtotal
      } = await this._invoiceItems(params, invoiceId, queryRunner, userId);
      const taxAmount = (INVOICE_TAX / 100) * subtotal;
      const grandTotal = subtotal + taxAmount;
      const invoiceNo = await this._invoiceNo(invoiceId);
      const userJournalist = await this.userJournalistRepository
        .createQueryBuilder('userJournalist')
        .innerJoinAndSelect('userJournalist.masterBank', 'masterBank')
        .where('userJournalist.id = :userJournalId', { userJournalId })
        .select([
          'userJournalist.media_name',
          'userJournalist.address',
          'userJournalist.bank_account_name',
          'userJournalist.account_no',
          'masterBank.name'
        ])
        .getOne();
      const masterBank = userJournalist?.masterBank;
      const { media_name, address, account_no, bank_account_name } = userJournalist;
      const templateParam = [
        invoiceNo,
        currentDate,
        duedate,
        media_name,
        address,
        INVOICE_TARGET_NAME,
        INVOICE_TARGET_ADDRESS,
        itemHtml,
        subtotal,
        taxAmount,
        grandTotal,
        masterBank.name,
        account_no,
        bank_account_name
      ];
      for (let index = 0; index < templateParam.length; index++) {
        const param = templateParam[index];
        html_template = html_template.replace(`{{${index + 1}}}`, param);
      }
      const invoicePdf = await this.commonService.htmlToPdf(html_template, '/invoice/');
      console.log(invoicePdf);
      await this.invoiceRepository
        .createQueryBuilder('invoice')
        .update()
        .set({
          from_address: address,
          from_name: media_name,
          to_name: INVOICE_TARGET_NAME,
          to_address: INVOICE_TARGET_ADDRESS,
          tax: `${taxAmount}`,
          invoice_html: html_template,
          grand_total: `${grandTotal}`,
          rek_name: bank_account_name,
          rek_no: account_no,
          invoice_pdf: invoicePdf,
          invoice_no: invoiceNo
        })
        .where('id = :invoiceId', { invoiceId })
        .returning('uuid')
        .setQueryRunner(queryRunner)
        .execute();
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

  private async _invoiceNo(invoiceId: number) {
    const invoiceNo = `${invoiceId}/BKKI/INV-TKR/${await this.commonService.randString(2, '1234567890', '')}`;
    return invoiceNo;
  }

  private async _invoiceItems(params: NewsItemsDTO[], invoiceId: number, queryRunner: QueryRunner, userId: number) {
    const { INVOICE_ITEM_HTML_TEMPLATE } = await this.commonService.generalParameter();
    let userJournalId = 0;
    let items = '';
    let subtotal = 0;
    for (let index = 0; index < params.length; index++) {
      const { newsId, price, quantity } = params[index];
      const news = await this.newsVerificationRepository.findOne({
        where: { uuid: newsId },
        select: ['userJournalistId', 'id', 'title']
      });
      if (!news) {
        throw new BadRequestException('Invalid News');
      }
      const newsInvoice = await this.newsInvoiceRepository
        .createQueryBuilder('newsInvoice')
        .where('newsInvoice.newsVerificationId = :newsId', { newsId: news.id })
        .select(['newsInvoice.id'])
        .setQueryRunner(queryRunner)
        .getOne();
      if (newsInvoice) {
        throw new BadRequestException('Berita Sudah Pernah Di generate invoice Sebelumnya');
      }
      if (index == 0) {
        userJournalId = news.userJournalistId;
      }
      if (userJournalId !== news.userJournalistId) {
        throw new BadRequestException('berita harus milik satu owner');
      }
      let item = INVOICE_ITEM_HTML_TEMPLATE;
      const param = [`${index + 1}`, `${news.title}`, `${quantity}`, `${price}`, `${quantity * price}`];
      subtotal += subtotal + quantity * price;
      for (let itemIdx = 0; itemIdx < param.length; itemIdx++) {
        const value = param[itemIdx];
        item = item.replace(`{{${itemIdx + 1}}}`, value);
      }
      items += `${item}\n`;
      await this.newsInvoiceRepository
        .createQueryBuilder('newsInvoice')
        .setQueryRunner(queryRunner)
        .insert()
        .values({
          invoiceId,
          generatedById: userId,
          newsVerificationId: news.id,
          quantity,
          unit_price: `${price}`,
          subtotal: `${quantity * price}`
        })
        .execute();
    }
    return { html: items, userJournalId, subtotal };
  }

  async getInvoice(id: string) {
    const invoice = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .innerJoinAndSelect('invoice.items', 'items')
      .innerJoin('items.newsVerification', 'newsVerification')
      .innerJoin('newsVerification.userJournalist', 'userJournalist')
      .where('invoice.uuid = :id', { id })
      .select(['invoice.invoice_html', 'invoice.invoice_pdf'])
      .getOne();
    return {
      html: invoice.invoice_html,
      pdf: invoice.invoice_pdf
    };
  }

  async listNews(param: ListMediaDTO) {
    param.page = param.page >= 1 ? param.page - 1 : param.page;
    const currentPage = param.page < 1 ? 1 : param.page + 1;
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
      const userJournalist = await this.userJournalistRepository.findOne({
        where: { userId },
        select: ['id']
      });
      if (!userJournalist) {
        throw new BadRequestException('Invalid User');
      }
      const { categoryId, desc, title, url } = param;
      const category = await this.masterNewsCategoryRepository.findOne({
        where: { id: categoryId },
        select: ['id']
      });
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
