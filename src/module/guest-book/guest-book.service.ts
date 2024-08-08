import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GuestBookRepository } from 'src/db/project-db/entity/guest-book/guest-book.repository';
import { requestGuestDTO } from './guest-book.dto';
import { MasterInstanceCategoryRepository } from 'src/db/project-db/entity/master-instance-category/master-instance-category.repository';
import { MasterWorkUnitRepository } from 'src/db/project-db/entity/master-work-unit/master-work-unit.repository';
import { CommonService } from '@common/service/common.service';
import { AppConfigService } from '@common/config/api/config.service';
import { MailerService } from '../mailer/mailer.service';
import { MasterService } from '../master/master.service';
import { ListMediaDTO } from '../media/media.dto';

@Injectable()
export class GuestBookService {
  constructor(
    private commonService: CommonService,
    private appConfigService: AppConfigService,
    private mailerService: MailerService,
    private masterService: MasterService
  ) {}
  @InjectRepository(GuestBookRepository) private guestBookRepository: GuestBookRepository;
  @InjectRepository(MasterInstanceCategoryRepository)
  private masterInstanceCategoryRepository: MasterInstanceCategoryRepository;
  @InjectRepository(MasterWorkUnitRepository) private masterWorkUnitRepository: MasterWorkUnitRepository;

  async requestGuest(param: requestGuestDTO) {
    const { endTime, guestName, instanceCategoryId, instanceName, pic, purpose, startTime, workUnitId, guestEmail } =
      param;
    const guestWaNo = this.commonService.changePhone(param.guestWaNo, '62');
    const instanceCategory = await this.masterInstanceCategoryRepository.findOne({
      where: { id: instanceCategoryId },
      select: ['id']
    });
    const workUnit = await this.masterWorkUnitRepository.findOne({ where: { id: workUnitId }, select: ['id'] });
    if (!instanceCategory || !workUnit) {
      throw new BadRequestException('Invalid Instance OR WorkUnit');
    }
    // check approved
    const approvedGuestBook = await this.guestBookRepository
      .createQueryBuilder('guestBook')
      .where('(:startTime BETWEEN guestBook.start_time AND guestBook.end_time) AND status = 1', { startTime })
      .select(['guestBook.id'])
      .getOne();
    if (approvedGuestBook) {
      throw new BadRequestException('Sudah Ada Janjian Untuk Bertemu di jam yang sama');
    }
    await this.guestBookRepository.insert({
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
    });
    // send email
    await this._sendMail([`${this.appConfigService.WEB_BASE_URL}`], guestEmail, 0);
  }

  private async _sendMail(params: string[], email: string, userId: number) {
    const scriptObj = await this.masterService.script().then(v => v.GUEST_REQUEST);
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

  async approveGuestBook(param, userId) {
    await this.guestBookRepository.update(param, userId);
  }
}
