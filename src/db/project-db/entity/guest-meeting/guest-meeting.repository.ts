import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { GuestMeeting } from './guest-meeting.entity';
import { ListMeetingDTO } from 'src/module/meeting/meeting.dto';

@Injectable()
export class GuestMeetingRepository extends Repository<GuestMeeting> {
  constructor(private dataSource: DataSource) {
    super(GuestMeeting, dataSource.createEntityManager());
  }

  private _whereDate(startDate: string, endDate: string) {
    const startDateQuery = startDate ? `meeting.start_time >= '${startDate}'` : '';
    const endDateQuery = endDate ? `meeting.start_time <= '${endDate}'` : '';
    const andQuery = startDate && endDateQuery ? ' AND ' : '';
    return startDateQuery || endDateQuery ? ` AND (${startDateQuery}${andQuery}${endDateQuery})` : '';
  }

  private _whereStatus(status) {
    const statusQuery = status >= 0 ? ` AND meeting.status = ${status}` : '';
    return statusQuery;
  }

  private _whereSearch(search: string) {
    const searchQuery = search
      ? ` AND (meeting.meeting_name LIKE '%${search}%' OR meeting.pic_name LIKE '%${search}%' OR participant.guest_name LIKE '%${search}%')`
      : '';
    return searchQuery;
  }

  async cnt(param: ListMeetingDTO) {
    const { endDate, search, startDate, status } = param;
    const syntax = `SELECT count(1)::INTEGER cnt FROM guest_meeting meeting,guest_meeting_participant participant WHERE participant."meetingId" = meeting.id${this._whereDate(
      startDate,
      endDate
    )}${this._whereSearch(search)}${this._whereStatus(status)} GROUP BY meeting.id`;
    const execute = await this.query(syntax, []).then(v => v?.[0]?.cnt || 0);
    return execute;
  }

  async list(param: ListMeetingDTO) {
    const { endDate, limit, page, search, startDate, status } = param;
    const skip = page * limit;
    const syntax = `SELECT meeting.uuid id,meeting.meeting_name name,(CASE WHEN meeting.type = 1 THEN 'Internal' WHEN meeting.type = 2 THEN 'External' ELSE '' END) "typeText",meeting.type,(CASE WHEN meeting.status = 0 THEN 'Belum Berlangsung' WHEN meeting.status = 1 THEN 'Sedang Berlangsung' WHEN meeting.status = 2 THEN 'berakhir' ELSE '' END) "statusText",meeting.status,TO_CHAR(meeting.created_at,'YYYY-MM-DD HH24:MI:SS') "createdAt",TO_CHAR(meeting.start_time,'YYYY-MM-DD HH24:MI:SS') "startTime",meeting.qr_code "qrCode",COUNT(1)::INTEGER "totalParticipant" FROM guest_meeting meeting,guest_meeting_participant participant WHERE participant."meetingId" = meeting.id${this._whereDate(
      startDate,
      endDate
    )}${this._whereSearch(search)}${this._whereStatus(
      status
    )} GROUP BY meeting.id ORDER BY meeting.id DESC LIMIT ${limit} OFFSET ${skip}`;
    return this.query(syntax, []);
  }

  async detail(id: string) {
    const syntax = `SELECT meeting.uuid id,meeting.meeting_name name,(CASE WHEN meeting.type = 1 THEN 'Internal' WHEN meeting.type = 2 THEN 'External' ELSE '' END) "typeText",meeting.type,(CASE WHEN meeting.status = 0 THEN 'Belum Berlangsung' WHEN meeting.status = 1 THEN 'Sedang Berlangsung' WHEN meeting.status = 2 THEN 'berakhir' ELSE '' END) "statusText",meeting.status,TO_CHAR(meeting.created_at,'YYYY-MM-DD HH24:MI:SS') "createdAt",TO_CHAR(meeting.start_time,'YYYY-MM-DD HH24:MI:SS') "startTime",TO_CHAR(meeting.end_time,'YYYY-MM-DD HH24:MI:SS') "endTime",meeting.qr_code "qrCode",
    meeting.purpose,
    meeting."location",
    meeting.pic_name "picName",
    meeting.pic_contact "picContact",
    json_agg(json_build_object (
			'id', participant.uuid,  
			'invitationNo',participant.invitation_no,
			'name', participant.guest_name, 
			'email', participant.guest_email, 
			'instance', participant.instance_name, 
			'waNo', participant.wa_no,
      'isCheckin',(CASE WHEN checkin.id IS NULL THEN false ELSE true END),
      'checkInTime',COALESCE(TO_CHAR(checkin.created_at,'YYYY-MM-DD HH24:MI:SS'),'')
		)) AS participants,COUNT(1)::INTEGER "totalParticipant" 
      FROM guest_meeting meeting 
        JOIN guest_meeting_participant participant ON meeting.id = participant."meetingId"
        LEFT JOIN guest_checkin checkin ON participant.id = checkin."participantId"
      WHERE meeting.uuid = $1 GROUP BY meeting.id`;
    return this.query(syntax, [id]).then(v => v?.[0] || null);
  }
}
