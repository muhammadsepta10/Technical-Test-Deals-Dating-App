import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GuestBookRepository } from 'src/db/project-db/entity/guest-book/guest-book.repository';
import { approveGuestDTO, requestGuestDTO } from './guest-book.dto';
import { MasterInstanceCategoryRepository } from 'src/db/project-db/entity/master-instance-category/master-instance-category.repository';
import { MasterWorkUnitRepository } from 'src/db/project-db/entity/master-work-unit/master-work-unit.repository';
import { CommonService } from '@common/service/common.service';
import { AppConfigService } from '@common/config/api/config.service';
import { MailerService } from '../mailer/mailer.service';
import { MasterService } from '../master/master.service';
import { ListMediaDTO } from '../media/media.dto';
import { QueryRunner } from 'typeorm';
import * as dayjs from 'dayjs';
import { ProjectDbConfigService } from '@common/config/db/project-db/config.service';

@Injectable()
export class GuestBookService {
  constructor(
    private commonService: CommonService,
    private appConfigService: AppConfigService,
    private mailerService: MailerService,
    private masterService: MasterService,
    private projectDbConfigService: ProjectDbConfigService
  ) {}
  @InjectRepository(GuestBookRepository)
  private guestBookRepository: GuestBookRepository;
  @InjectRepository(MasterInstanceCategoryRepository)
  private masterInstanceCategoryRepository: MasterInstanceCategoryRepository;
  @InjectRepository(MasterWorkUnitRepository)
  private masterWorkUnitRepository: MasterWorkUnitRepository;

  async detailGuestBook(id: string) {
    const detail = await this.guestBookRepository.detail(id);
    return detail;
  }

  async requestGuest(param: requestGuestDTO) {
    const { endTime, guestName, instanceCategoryId, instanceName, pic, purpose, startTime, workUnitId, guestEmail } =
      param;
    const dataSource = await this.projectDbConfigService.dbConnection();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const guestWaNo = this.commonService.changePhone(param.guestWaNo, '62');
      const instanceCategory = await this.masterInstanceCategoryRepository.findOne({
        where: { id: instanceCategoryId },
        select: ['id']
      });
      const workUnit = await this.masterWorkUnitRepository.findOne({
        where: { id: workUnitId },
        select: ['id']
      });
      if (!instanceCategory || !workUnit) {
        throw new BadRequestException('Invalid Instance OR WorkUnit');
      }
      // check approved
      await this._checkAlreadyGuest(startTime, endTime, pic, queryRunner);
      const guestBook = await this.guestBookRepository
        .createQueryBuilder('guestBook')
        .insert()
        .values({
          start_time: startTime,
          end_time: endTime,
          guest_name: guestName,
          guest_email: guestEmail,
          purpose,
          instance_name: instanceName,
          pic,
          wa_no: guestWaNo,
          masterWorkUnitId: workUnitId,
          masterInstanceCategoryId: instanceCategoryId,
          status: 0
        })
        .setQueryRunner(queryRunner)
        .returning(['uuid'])
        .execute();
      // send email
      await this._sendMail(
        [`${this.appConfigService.WEB_BASE_URL}/guest/${guestBook.raw[0].uuid}`],
        guestEmail,
        'GUEST_REQUEST',
        null
      );
      await queryRunner.commitTransaction();
      return { message: 'Cek email Anda' };
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

  private async _sendMail(params: string[], email: string, script: string, userId?: number) {
    const scriptObj = await this.masterService.script().then(v => v[script]);
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

  private async _checkAlreadyGuest(startTime: string, endTime: string, pic, queryRunner: QueryRunner) {
    startTime = dayjs(startTime).format('YYYY-MM-DD HH:mm:ss');
    endTime = dayjs(endTime).format('YYYY-MM-DD HH:mm:ss');
    const approvedGuestBook = await this.guestBookRepository
      .createQueryBuilder('guestBook')
      .setQueryRunner(queryRunner)
      .where(
        "((TO_CHAR(guestBook.start_time,'YYYY-MM-DD HH24:MI:SS') BETWEEN :startTime AND :endTime) OR (TO_CHAR(guestBook.end_time,'YYYY-MM-DD HH24:MI:SS') BETWEEN :startTime AND :endTime)) AND guestBook.status = 1 AND guestBook.pic = :pic",
        { startTime, pic, endTime }
      )
      .getCount();
    if (approvedGuestBook > 0) {
      throw new BadRequestException(
        'sudah ada janjian di jam yg sama dengan PIC tersebut, mohon buat janji ulang di jam lain'
      );
    }
  }

  async listGuestBook(param: ListMediaDTO) {
    param.page = param.page >= 1 ? param.page - 1 : param.page;
    const currentPage = param.page < 1 ? 1 : param.page + 1;
    const data = await this.guestBookRepository.list(param);
    const totalData = await this.guestBookRepository.countData(param);
    const totalPage = Math.ceil(totalData / param.limit);
    return {
      totalData,
      totalPage,
      currentPage,
      raw: data
    };
  }

  async approveGuestBook(param: approveGuestDTO, userId) {
    const { guestBookId, status, reason } = param;
    const dataSource = await this.projectDbConfigService.dbConnection();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const guestBook = await this.guestBookRepository.findOne({
        where: { uuid: guestBookId },
        select: ['status', 'id', 'pic', 'start_time', 'end_time', 'guest_email']
      });
      if (!guestBook) {
        throw new BadRequestException('Invalid Id');
      }
      if (guestBook?.status != 0) {
        throw new BadRequestException('Buku Tamu Sudah Pernah Disetujui');
      }
      const { id, pic, guest_email: email } = guestBook;
      const startTime = dayjs(guestBook.start_time).format('YYYY-MM-DD HH:mm:ss');
      const endTime = dayjs(guestBook.end_time).format('YYYY-MM-DD HH:mm:ss');
      const emailParam = [];
      if (status == 1) {
        await this._checkAlreadyGuest(startTime, endTime, pic, queryRunner);
      }
      if (status == 2) {
        const invalidReason = (await this.masterService.invalidReason({ type: 2 })).find(v => v.id == reason);
        if (!invalidReason) {
          throw new BadRequestException('Invalid Reason');
        }
      }
      const updatedGuest = await this.guestBookRepository
        .createQueryBuilder('guestBook')
        .update()
        .set({
          status,
          masterReasonId: reason || null,
          approvedById: userId
        })
        .where('id = :id AND status = 0', { id })
        .setQueryRunner(queryRunner)
        .execute();
      if (updatedGuest.affected < 1) {
        throw new BadRequestException('Invalid Approved');
      }
      await this._sendMail(emailParam, email, `GUEST_${status == 1 ? 'APPROVED' : 'REJECTED'}`, null);
      await queryRunner.commitTransaction();
      return { message: 'Success Approved' };
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
}
