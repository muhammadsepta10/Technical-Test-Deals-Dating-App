import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { NewsVerification } from './news-verification.entity';
import { ListMediaDTO } from 'src/module/media/media.dto';
import { NewsVerificationDTO } from './news-verification.dto';
import * as dayjs from 'dayjs';

@Injectable()
export class NewsVerificationRepository extends Repository<NewsVerification> {
  constructor(private dataSource: DataSource) {
    super(NewsVerification, dataSource.createEntityManager());
  }

  private _whereStatus(status: number) {
    return status < 0 ? '' : ` AND news_verification.status = ${status}`;
  }

  private _whereDate({ endDate, startDate }: { startDate: string; endDate: string }) {
    if (startDate && endDate && dayjs(startDate, 'YYYY-MM-DD').isValid() && dayjs(endDate, 'YYYY-MM-DD').isValid()) {
      startDate = dayjs(startDate).format('YYYY-MM-DD');
      endDate = dayjs(endDate).format('YYYY-MM-DD');
      return ` AND (TO_CHAR(news_verification.created_at,'YYYY-MM-DD') BETWEEN '${startDate}' AND '${endDate}')`;
    }
    return '';
  }

  private _whereKeys(search: string) {
    return search?.length < 1
      ? ''
      : ` AND (news_verification.title LIKE '%${search}%' OR news_verification.desc LIKE '%${search}%' OR user_journalist.journalist_id LIKE '%${search}%')`;
  }

  private _whereUser(userId: number) {
    return userId ? ` AND (user_journalist."userId" = ${userId})` : '';
  }

  private _whereIsInvoice(isInvoice: number) {
    return isInvoice == 0
      ? ` AND (news_invoice."newsVerificationId" IS NULL)`
      : isInvoice == 1
        ? ` AND (news_invoice."newsVerificationId" IS NOT NULL)`
        : '';
  }

  async cart(userId?: number) {
    const syntax = `SELECT SUM(CASE WHEN news_verification.status = 0 THEN 1 ELSE 0 END)::INTEGER AS unverified, SUM(CASE WHEN news_verification.status = 1 THEN 1 ELSE 0 END)::INTEGER AS "verified", SUM(CASE WHEN news_verification.status = 2 THEN 1 ELSE 0 END)::INTEGER AS rejected FROM news_verification JOIN user_journalist ON news_verification."userJournalistId" = user_journalist.id WHERE 1=1${this._whereUser(
      userId
    )}
`;
    return this.query(syntax, []).then(v => v?.[0] || {});
  }

  async cartPerMonth(year: string, userId?: number) {
    const syntax = `SELECT DATE_TRUNC('month', news_verification.created_at) AS month, SUM(CASE WHEN news_verification.status = 0 THEN 1 ELSE 0 END)::INTEGER AS unverified, SUM(CASE WHEN news_verification.status = 1 THEN 1 ELSE 0 END)::INTEGER AS verified, SUM(CASE WHEN news_verification.status = 2 THEN 1 ELSE 0 END)::INTEGER AS rejected FROM news_verification JOIN user_journalist ON news_verification."userJournalistId" = user_journalist.id WHERE TO_CHAR(news_verification.created_at,'YYYY') = '${year}'${this._whereUser(
      userId
    )} GROUP BY month ORDER BY month;`;
    return this.query(syntax, []);
  }

  async list(param: ListMediaDTO) {
    const syntax = `SELECT (CASE WHEN news_invoice."newsVerificationId" IS NULL THEN 0 ELSE 1 END) "isInvoice",user_journalist.journalist_id "mediaId",user_journalist.media_name,  news_verification.uuid as id, news_verification.title, news_verification."desc", news_verification.status, (CASE WHEN news_verification.status = 0 THEN 'Unverif' WHEN news_verification.status = 1 THEN 'Verified' WHEN news_verification.status = 2 THEN 'Rejected' ELSE '' END) "statusText", TO_CHAR(news_verification.created_at,'YYYY-MM-DD') "createdDate" from news_verification JOIN user_journalist ON news_verification."userJournalistId" = user_journalist.id LEFT JOIN news_invoice ON news_invoice."newsVerificationId" = news_verification.id WHERE 1=1 ${this._whereDate(
      { startDate: param.startDate, endDate: param.endDate }
    )}${this._whereKeys(param?.search)}${this._whereStatus(
      param.status
    )}${this._whereUser(param.userId)}${this._whereIsInvoice(
      param.isInvoice
    )} ORDER BY news_verification.created_at DESC LIMIT ${param.limit} OFFSET ${param.page * param.limit}`;
    return this.query(syntax, []);
  }

  async countData(param: ListMediaDTO): Promise<number> {
    const syntax = `SELECT count(1) cnt from news_verification,user_journalist WHERE news_verification."userJournalistId" = user_journalist.id ${this._whereDate(
      { startDate: param.startDate, endDate: param.endDate }
    )}${this._whereKeys(param?.search)}${this._whereStatus(param.status)}`;
    return this.query(syntax, []).then(v => +v?.[0]?.cnt || 0);
  }

  async detail(id: string): Promise<NewsVerificationDTO> {
    const syntax = `SELECT news_verification.url "newsUrl", user_journalist.journalist_id "mediaId",user_journalist.media_name,news_verification.uuid AS id, news_verification.title, news_verification."desc", news_verification.status, (CASE WHEN news_verification.status = 0 THEN 'Unverif' WHEN news_verification.status = 1 THEN 'Verified' WHEN news_verification.status = 2 THEN 'Rejected' ELSE '' END) AS statusText, COALESCE(TO_CHAR(news_verification.created_at, 'YYYY-MM-DD HH24:MI:SS'), '') AS created_at, COALESCE(TO_CHAR(news_verification.approved_at, 'YYYY-MM-DD HH24:MI:SS'), '') AS approved_at, COALESCE(TO_CHAR(news_verification.verified_at, 'YYYY-MM-DD HH24:MI:SS'), '') AS verified_at, COALESCE(verified.name, '') AS verifiedBy, COALESCE(approved.name, '') AS approvedBy, COALESCE(json_agg(json_build_object('id', news_verification_doc.id, 'description', COALESCE(news_verification_doc.description, ''), 'url', news_verification_doc.url)) FILTER (WHERE news_verification_doc.id IS NOT NULL AND news_verification_doc.status = 1), '[]') AS documents FROM news_verification JOIN user_journalist ON news_verification."userJournalistId" = user_journalist.id LEFT JOIN "user" AS verified ON verified.id = news_verification."verifiedById" LEFT JOIN "user" AS approved ON approved.id = news_verification."approvedById" JOIN news_verification_doc ON news_verification.id = news_verification_doc."newsVerificationId" WHERE news_verification.uuid = $1 GROUP BY news_verification.uuid, news_verification.title, news_verification."desc", news_verification.status, news_verification.created_at, news_verification.approved_at, news_verification.verified_at, verified.name, approved.name,journalist_id,media_name,news_verification.url`;
    const data = await this.query(syntax, [id]);
    return data?.[0];
  }
}
