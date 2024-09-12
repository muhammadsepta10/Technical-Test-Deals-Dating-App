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
import { MasterService } from '../master/master.service';

@Injectable()
export class MeetingService {
  constructor(
    private projectDbConfigService: ProjectDbConfigService,
    private commonService: CommonService,
    private mailService: MailerService,
    private appConfigService: AppConfigService,
    private masterService: MasterService
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
        content: meetingUid,
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
          const participant = await this.guestMeetingParticipantRepository
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
            .returning(['id', 'uuid'])
            .execute();
          const participantId = participant?.[0]?.id?.toString();
          const participantUid = participant?.[0]?.uuid || '';
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
          const urlCheckin = `${this.appConfigService.WEB_BASE_URL}/check-in/${participantUid}`;
          await this._sendMail(
            [meetingName, location, dayJs(startTime).locale('ID').format('DD MMMM YYYY, HH:mm'), urlCheckin],
            email,
            'inviteParticipant',
            0
          );
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

  private async _sendMail(params: string[], email: string, script: string, userId?: number) {
    const scriptObj = await this.masterService.script().then(v => v[script]);
    params.map((v, idx) => {
      scriptObj.body = scriptObj.body.replace(`{{${idx + 1}}}`, v);
      scriptObj.title = scriptObj.title.replace(`{{${idx + 1}}}`, v);
    });
    await this.mailService.sendMail({
      email: email,
      subject: scriptObj.title,
      userId,
      text: scriptObj.body
    });
  }

  async participantDetail(id: string) {
    const participant = await this.guestMeetingParticipantRepository
      .createQueryBuilder('participant')
      .innerJoinAndSelect('participant.meeting', 'meeting')
      .leftJoinAndSelect('participant.checkin', 'checkin')
      .where('participant.uuid = :id', { id })
      .select('participant.uuid', 'id')
      .addSelect('participant.invitation_no', 'invitationNo')
      .addSelect('participant.guest_name', 'name')
      .addSelect('participant.guest_email', 'email')
      .addSelect('participant.instance_name', 'instanceName')
      .addSelect('participant.instance_name', 'instanceName')
      .addSelect('participant.depratement_name', 'depratementName')
      .addSelect('participant.wa_no', 'waNo')
      .addSelect('meeting.meeting_name', 'meetingName')
      .addSelect('participant.status', 'status')
      .addSelect("(CASE WHEN participant.status = 1 THEN 'Hadir' ELSE 'Belum Hadir' END)", 'statusText')
      .addSelect("COALESCE(TO_CHAR(checkin.checkin_time,'YYYY-MM-DD HH24:MI:SS'),'')", 'checkinTime')
      .getRawOne();
    return participant;
  }

  async checkin(param: CheckinDTO) {
    const { meetingId, participantId } = param;
    const dataSource = await this.projectDbConfigService.dbConnection();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const participant = await this.guestMeetingParticipantRepository
        .createQueryBuilder('participant')
        .innerJoinAndSelect('participant.meeting', 'meeting')
        .where('uuid = :participantId AND meeting.uuid = :meetingId', {
          participantId,
          meetingId
        })
        .select(['participant.id', 'participant.status'])
        .getOne();
      if (!participant) {
        throw new BadRequestException('Invalid participant');
      }
      if (participant.status != 0) {
        throw new BadRequestException('Already checkin');
      }
      await this.guestMeetingParticipantRepository
        .createQueryBuilder('participant')
        .where('id = :id AND status = 0', { id: participant.id })
        .update()
        .set({
          status: 1
        })
        .setQueryRunner(queryRunner)
        .execute();
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
