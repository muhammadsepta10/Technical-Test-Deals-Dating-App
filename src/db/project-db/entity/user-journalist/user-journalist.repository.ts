import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { UserJournalist } from './user-journalist.entity';
import { ListJournalistParamDTO } from './user-journlist.types';
import * as dayjs from 'dayjs';

@Injectable()
export class UserJournalistRepository extends Repository<UserJournalist> {
  constructor(private dataSource: DataSource) {
    super(UserJournalist, dataSource.createEntityManager());
  }

  private _whereStatus(status: number) {
    return status < 0 ? '' : ` AND status = ${status}`;
  }

  private _whereDate({ endDate, startDate }: { startDate: string; endDate: string }) {
    if (startDate && endDate && dayjs(startDate, 'YYYY-MM-DD').isValid() && dayjs(endDate, 'YYYY-MM-DD').isValid()) {
      startDate = dayjs(startDate).format('YYYY-MM-DD');
      endDate = dayjs(endDate).format('YYYY-MM-DD');
      return ` AND (TO_CHAR(created_at,'YYYY-MM-DD') BETWEEN '${startDate}' AND '${endDate}')`;
    }
    return '';
  }

  private _whereKeys(search: string) {
    return search?.length < 1
      ? ''
      : ` AND (media_name LIKE '%${search}%' OR whatsapp_no LIKE '%${search}%' OR email LIKE '%${search}%' OR journalist_id LIKE '%${search}%')`;
  }

  async listJournalist(param: ListJournalistParamDTO) {
    const { limit, search, page, status, startDate, endDate } = param;
    const skip = page * limit;
    const syntax = `SELECT uuid as id,media_name,whatsapp_no,email,status,(CASE WHEN status = 0 THEN 'Unverif' WHEN status = 1 THEN 'Verified' WHEN status = 2 THEN 'Rejected' ELSE '' END) "statusText", COALESCE(journalist_id,'') "mediaId", TO_CHAR(created_at,'YYYY-MM-DD HH24:MI:SS.MS') "createdDate" FROM user_journalist WHERE 1=1${this._whereStatus(
      status
    )}${this._whereKeys(search)}${this._whereDate({
      startDate,
      endDate
    })} ORDER BY id DESC LIMIT ${limit} OFFSET ${skip}`;
    return this.query(syntax, []);
  }

  async countData(param: ListJournalistParamDTO): Promise<number> {
    const { search, status, startDate, endDate } = param;
    const syntax = `SELECT count(1) cnt FROM user_journalist WHERE 1=1${this._whereStatus(
      status
    )}${this._whereKeys(search)}${this._whereDate({ startDate, endDate })}`;
    return this.query(syntax, []).then(v => +v?.[0]?.cnt || 0);
  }

  async cartPerMonth(year: string) {
    const syntax = `SELECT TO_CHAR(user_journalist.created_at,'YYYY-MM') AS month, SUM(CASE WHEN user_journalist.status = 0 THEN 1 ELSE 0 END)::INTEGER AS unverified, SUM(CASE WHEN user_journalist.status = 1 THEN 1 ELSE 0 END)::INTEGER AS verified, SUM(CASE WHEN user_journalist.status = 2 THEN 1 ELSE 0 END)::INTEGER AS rejected FROM user_journalist WHERE TO_CHAR(user_journalist.created_at,'YYYY') = '${year}' GROUP BY 	month ORDER BY month;`;
    return this.query(syntax, []);
  }

  async cart() {
    const syntax = `SELECT SUM(CASE WHEN user_journalist.status = 0 THEN 1 ELSE 0 END)::INTEGER AS unverified, SUM(CASE WHEN user_journalist.status = 1 THEN 1 ELSE 0 END)::INTEGER AS verified, SUM(CASE WHEN user_journalist.status = 2 THEN 1 ELSE 0 END)::INTEGER AS rejected FROM user_journalist WHERE 1 = 1;`;
    return this.query(syntax, []).then(v => v?.[0] || {});
  }

  async detail(id: string) {
    const syntax = `SELECT 
      user_journalist.uuid id,
      user_journalist.media_name,
      user_journalist.whatsapp_no,
      user_journalist.email,
      user_journalist.status,
      (CASE WHEN user_journalist.status = 0 THEN 'Unverif' WHEN user_journalist.status = 1 THEN 'Verified' WHEN user_journalist.status = 2 THEN 'Rejected' ELSE '' END) "statusText",
      COALESCE(user_journalist.journalist_id,'') "mediaId",
      COALESCE(TO_CHAR(user_journalist.created_at, 'YYYY-MM-DD HH24:MI:SS'),'') AS created_at,
      COALESCE(TO_CHAR(user_journalist.approved_at, 'YYYY-MM-DD HH24:MI:SS'),'') AS approved_at,
      COALESCE(TO_CHAR(user_journalist.verified_at, 'YYYY-MM-DD HH24:MI:SS'),'') AS verified_at,
      user_journalist.instagram_link,
      user_journalist.facebook_link,
      user_journalist.x_link,
      user_journalist.tiktok_link,
      user_journalist.youtube_link,
      user_journalist.website_link,
      user_journalist.podcast_link,
      user_journalist.account_no,
      user_journalist.pers_card_no,
      user_journalist.npwp,
      COALESCE(verified.name,'') "verifiedBy",
      COALESCE(approved.name,'') "approvedBy",
      COALESCE(master_bank.name,'') bank,
      COALESCE(json_agg(
      json_build_object(
        'id', user_journalist_doc.id,
        'description', COALESCE(user_journalist_doc.description,''),
        'url', user_journalist_doc.url
      )) FILTER (WHERE user_journalist_doc.id IS NOT NULL AND user_journalist_doc.status = 1), '[]') AS documents
    FROM user_journalist 
    LEFT JOIN "user" AS verified ON verified.id = user_journalist."verifiedById"
    LEFT JOIN "user" as approved ON approved.id = user_journalist."approvedById"
    LEFT JOIN master_bank ON master_bank.id = user_journalist."masterBankId"
    JOIN user_journalist_doc ON user_journalist.id = user_journalist_doc."userJournalistId"
    WHERE user_journalist.uuid = $1
    GROUP BY user_journalist.id, verified.name, approved.name, master_bank.name`;
    const data = await this.query(syntax, [id]);
    return data?.[0];
  }
}
