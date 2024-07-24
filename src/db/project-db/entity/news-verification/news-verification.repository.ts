import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { NewsVerification } from './news-verification.entity';
import { ListMediaDTO } from 'src/module/media/media.dto';
import { NewsVerificationDTO } from './news-verification.dto';

@Injectable()
export class NewsVerificationRepository extends Repository<NewsVerification> {
  constructor(private dataSource: DataSource) {
    super(NewsVerification, dataSource.createEntityManager());
  }

  private _whereStatus(status: number) {
    return status < 0 ? '' : ` AND status = ${status}`;
  }

  private _whereKeys(search: string) {
    return search?.length < 1 ? '' : ` AND (title LIKE '%${search}%' OR desc LIKE '%${search}%')`;
  }

  async list(param: ListMediaDTO) {
    const syntax = `SELECT uuid as id, title, "desc", status, (CASE WHEN status = 0 THEN 'Unverif' WHEN status = 1 THEN 'On Verif' WHEN status = 2 THEN 'Verified' WHEN status = 3 THEN 'Rejected' ELSE '' END) "statusText" from news_verification WHERE 1=1${this._whereKeys(param?.search)}${this._whereStatus(param.status)} LIMIT ${param.limit} OFFSET ${param.skip}`;
    return this.query(syntax, []);
  }

  async detail(id: string): Promise<NewsVerificationDTO> {
    const syntax = `SELECT news_verification.uuid AS id, news_verification.title, news_verification."desc", news_verification.status, (CASE WHEN news_verification.status = 0 THEN 'Unverif' WHEN news_verification.status = 1 THEN 'On Verif' WHEN news_verification.status = 2 THEN 'Verified' WHEN news_verification.status = 3 THEN 'Rejected' ELSE '' END) AS statusText, COALESCE(TO_CHAR(news_verification.created_at, 'YYYY-MM-DD HH24:MI:SS'), '') AS created_at, COALESCE(TO_CHAR(news_verification.approved_at, 'YYYY-MM-DD HH24:MI:SS'), '') AS approved_at, COALESCE(TO_CHAR(news_verification.verified_at, 'YYYY-MM-DD HH24:MI:SS'), '') AS verified_at, COALESCE(verified.name, '') AS verifiedBy, COALESCE(approved.name, '') AS approvedBy, COALESCE(json_agg(json_build_object('id', news_verification_doc.id, 'description', COALESCE(news_verification_doc.description, ''), 'url', news_verification_doc.url)) FILTER (WHERE news_verification_doc.id IS NOT NULL AND news_verification_doc.status = 1), '[]') AS documents FROM news_verification LEFT JOIN "user" AS verified ON verified.id = news_verification."verifiedById" LEFT JOIN "user" AS approved ON approved.id = news_verification."approvedById" JOIN news_verification_doc ON news_verification.id = news_verification_doc."newsVerificationId" WHERE news_verification.uuid = $1 GROUP BY news_verification.uuid, news_verification.title, news_verification."desc", news_verification.status, news_verification.created_at, news_verification.approved_at, news_verification.verified_at, verified.name, approved.name`;
    const data = await this.query(syntax, [id]);
    return data?.[0];
  }
}
