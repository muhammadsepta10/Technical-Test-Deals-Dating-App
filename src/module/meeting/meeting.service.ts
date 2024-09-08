import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CheckinDTO, ListMeetingDTO, SubmitMeetingDTO } from './meeting.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GuestMeetingRepository } from 'src/db/project-db/entity/guest-meeting/guest-meeting.repository';
import { GuestMeetingParticipantRepository } from 'src/db/project-db/entity/guest-meeting-participant/guest-meeting-participant.repository';
import { GuestCheckinRepository } from 'src/db/project-db/entity/guest-checkin/guest-checkin.repository';
import { ProjectDbConfigService } from '@common/config/db/project-db/config.service';
import { CommonService } from '@common/service/common.service';
import { MailerService } from '../mailer/mailer.service';
import * as dayJs from 'dayjs';
import { AppConfigService } from '@common/config/api/config.service';

@Injectable()
export class MeetingService {
  constructor(
    private projectDbConfigService: ProjectDbConfigService,
    private commonService: CommonService,
    private mailService: MailerService,
    private appConfigService: AppConfigService
  ) {}
  @InjectRepository(GuestMeetingRepository)
  private guestMeetingRepository: GuestMeetingRepository;
  @InjectRepository(GuestMeetingParticipantRepository)
  private guestMeetingParticipantRepository: GuestMeetingParticipantRepository;
  @InjectRepository(GuestCheckinRepository)
  private guestCheckinRepository: GuestCheckinRepository;

  async submitMeeting(param: SubmitMeetingDTO, userId: number) {
    const {
      endTime,
      location,
      meetingName,
      participant: participants,
      pic,
      picContact,
      purpose,
      startTime,
      type
    } = param;

    const dataSource = await this.projectDbConfigService.dbConnection();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const meeting = await this.guestMeetingRepository
        .createQueryBuilder('meeting')
        .insert()
        .values({
          start_time: startTime,
          end_time: endTime,
          location: location,
          purpose: purpose,
          type,
          pic_name: pic,
          meeting_name: meetingName,
          createdById: userId,
          status: 0,
          pic_contact: picContact
        })
        .setQueryRunner(queryRunner)
        .returning(['id', 'uuid'])
        .execute()
        .then(v => v.raw[0]);
      const meetingId = meeting.id;
      const meetingUid = meeting.uuid;
      const qrCode = await this.commonService.generateQrCode({
        content: `${this.appConfigService.WEB_BASE_URL}/meeting/${meetingUid}`,
        style: 'stain'
      });
      await this.guestMeetingRepository
        .createQueryBuilder('meeting')
        .update()
        .set({ qr_code: qrCode })
        .where('id = :meetingId', { meetingId })
        .setQueryRunner(queryRunner)
        .execute();
      if (type === 1) {
        // for meeting internal
        // in meeting internal the data is get from eoffice empole data for fill participantdata
        throw new InternalServerErrorException('hubungi iful', 'Code nya belum ada');
      }
      if (type === 2) {
        // for meeting external
        for (let index = 0; index < participants.length; index++) {
          const { email, instanceName, name } = participants[index];
          const waNo = this.commonService.changePhone(participants[index].waNo, '62');
          const participantId = await this.guestMeetingParticipantRepository
            .createQueryBuilder('participant')
            .insert()
            .values({
              guest_email: email,
              guest_name: name,
              instance_name: instanceName,
              wa_no: waNo,
              meetingId: meetingId
            })
            .setQueryRunner(queryRunner)
            .returning('id')
            .execute()
            .then(v => v.raw[0].id.toString());
          const id =
            participantId.length == 1 ? `00${participantId}` : participantId == 2 ? `0${participantId}` : participantId;
          const invitationNo = `${await this.commonService.randString(4, 'QWERTYUIOPLKJHGFDSAZXCVBNM', '')}${id}`;
          await this.guestMeetingParticipantRepository
            .createQueryBuilder('participant')
            .update()
            .set({
              invitation_no: invitationNo
            })
            .where('id = :id', { id: participantId })
            .setQueryRunner(queryRunner)
            .execute();
          //   send email after this
        }
      }
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

  async checkin(param: CheckinDTO) {
    const { invitationNo } = param;
    const dataSource = await this.projectDbConfigService.dbConnection();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const participant = await this.guestMeetingParticipantRepository
        .createQueryBuilder('participant')
        .where('invitation_no = :invitationNo', { invitationNo })
        .select(['participant.id', 'participant.status'])
        .getOne();
      if (!participant) {
        throw new BadRequestException('Invalid participant');
      }
      if (participant.status != 0) {
        throw new BadRequestException('Already checkin');
      }
      const currentDate = dayJs().format('YYYY-MM-DD HH:mm:ss');
      await this.guestCheckinRepository
        .createQueryBuilder('checkin')
        .insert()
        .values({
          checkin_time: currentDate,
          participantId: participant.id
        })
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

  async listMeeting(param: ListMeetingDTO) {
    param.page = param.page >= 1 ? param.page - 1 : param.page;
    const currentPage = param.page < 1 ? 1 : param.page + 1;
    const data = await this.guestMeetingRepository.list(param);
    const totalData = await this.guestMeetingRepository.cnt(param);
    const totalPage = Math.ceil(totalData / param.limit);
    return {
      totalData,
      totalPage,
      currentPage,
      raw: data
    };
  }

  async detailMeeting(id: string) {
    return this.guestMeetingRepository.detail(id);
  }
}
