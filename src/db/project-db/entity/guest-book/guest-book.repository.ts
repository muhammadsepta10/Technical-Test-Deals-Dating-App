import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { GuestBook } from './guest-book.entity';
import { ListMediaDTO } from 'src/module/media/media.dto';
import * as dayjs from 'dayjs';

@Injectable()
export class GuestBookRepository extends Repository<GuestBook> {
  constructor(private dataSource: DataSource) {
    super(GuestBook, dataSource.createEntityManager());
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
      : ` AND (instance_name LIKE '%${search}%' OR wa_no LIKE '%${search}%' OR guest_email LIKE '%${search}%')`;
  }

  async list(param: ListMediaDTO) {
    const syntax = `SELECT
                      uuid id,
                      instance_name "instanceName",
                      wa_no "waNo",
                      guest_email email,
                      guest_book.status,
                      (
                        CASE WHEN status = 0 THEN
                          'Process'
                        WHEN status = 1 THEN
                          'Approved'
                        WHEN status = 2 THEN
                          'REJECTED'
                        ELSE
                          'Process'
                        END) "statusText"
                    FROM
                      guest_book 
                    WHERE 1=1${this._whereDate({ endDate: param.endDate, startDate: param.startDate })}${this._whereStatus(param.status)}${this._whereKeys(param.search)} 
                        LIMIT ${param.limit} OFFSET ${param.page * param.limit}`;
    return this.query(syntax);
  }

  async countData(param: ListMediaDTO) {
    const syntax = `SELECT
                      COUNT(1) cnt
                    FROM
                      guest_book 
                    WHERE 1=1${this._whereDate({ endDate: param.endDate, startDate: param.startDate })}${this._whereStatus(param.status)}${this._whereKeys(param.search)}`;
    return this.query(syntax).then(v => +v?.[0]?.cnt || 0);
  }
}
