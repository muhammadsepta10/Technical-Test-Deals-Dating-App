import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { UserJournalist } from './user-journalist.entity';
import { ListJournalistParamDTO } from './user-journlist.types';

@Injectable()
export class UserJournalistRepository extends Repository<UserJournalist> {
  constructor(private dataSource: DataSource) {
    super(UserJournalist, dataSource.createEntityManager());
  }

  private _whereStatus(status: number) {
    return status < 0 ? '' : ` AND status = ${status}`;
  }

  private _whereKeys(search: string) {
    return search?.length < 1
      ? ''
      : ` AND (media_name LIKE '%${search}%' OR whatsapp_no LIKE '%${search}%' OR email LIKE '%${search}%')`;
  }

  async listJournalist(param: ListJournalistParamDTO) {
    const { limit, search, skip, status } = param;
    const syntax = `SELECT uuid as id,media_name,whatsapp_no,email,status,(CASE WHEN status = 0 THEN 'Unverif' WHEN status = 1 THEN 'On Verif' WHEN status = 2 THEN 'Verified' WHEN status = 3 THEN 'Rejected' ELSE '' END) "statusText", COALESCE(journalist_id,'') "mediaId" FROM user_journalist WHERE 1=1${this._whereStatus(status)}${this._whereKeys(search)} LIMIT ${limit} OFFSET ${skip}`;
    return this.query(syntax, []);
  }

  async detail(id: string) {
    const syntax = `SELECT user_journalist.media_name,
      user_journalist.whatsapp_no,
      user_journalist.email,
      user_journalist.status,
      (CASE WHEN user_journalist.status = 0 THEN 'Unverif' WHEN user_journalist.status = 1 THEN 'On Verif' WHEN user_journalist.status = 2 THEN 'Verified' ELSE '' END) "statusText",
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
