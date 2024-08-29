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
      return ` AND (TO_CHAR(guest_book.start_time,'YYYY-MM-DD') BETWEEN '${startDate}' AND '${endDate}')`;
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
                      TO_CHAR(guest_book.start_time,'YYYY-MM-DD HH24:MI:SS') "startTime",
                      TO_CHAR(guest_book.end_time,'YYYY-MM-DD HH24:MI:SS') "endTime",
                      guest_book.pic,
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
                    WHERE 1=1${this._whereDate({
                      endDate: param.endDate,
                      startDate: param.startDate
                    })}${this._whereStatus(param.status)}${this._whereKeys(param.search)} 
                        LIMIT ${param.limit} OFFSET ${param.page * param.limit}`;
    return this.query(syntax);
  }

  async detail(id: string) {
    const syntax = `SELECT
	guest_book.uuid id,
	guest_book.instance_name "instanceName",
	guest_book.wa_no "waNo",
	COALESCE("approvedBy"."name",'') "approvedBy",
	TO_CHAR(guest_book.created_at, 'YYYY-MM-DD HH24:MI:SS') "createdAt",
	guest_book.guest_email "email",
	guest_book.guest_name "name",
	guest_book.pic "pic",
	guest_book.purpose,
	guest_book.status,
	TO_CHAR(guest_book.approved_at, 'YYYY-MM-DD HH24:MI:SS') "approvedAt",
	(
		CASE WHEN guest_book.status = 0 THEN
			'Process'
		WHEN guest_book.status = 1 THEN
			'Approved'
		WHEN guest_book.status = 2 THEN
			'REJECTED'
		ELSE
			'Process'
		END) "statusText",
	TO_CHAR(guest_book.start_time, 'YYYY-MM-DD HH24:MI:SS') "startTime",
	TO_CHAR(guest_book.end_time, 'YYYY-MM-DD HH24:MI:SS') "endTime",
	"workUnit"."name" "workUnit",
	"instanceCategory"."name" "isntanceCategory"
FROM
	guest_book
	LEFT JOIN "user" "approvedBy" ON "approvedBy".id = guest_book. "approvedById"
	JOIN master_work_unit "workUnit" ON "workUnit".id = guest_book. "masterWorkUnitId"
	JOIN master_instance_category "instanceCategory" ON "instanceCategory".id = guest_book. "masterInstanceCategoryId"
WHERE
	guest_book.uuid = $1`;
    const data = await this.query(syntax, [id]);
    return data?.[0] || null;
  }

  async countData(param: ListMediaDTO) {
    const syntax = `SELECT
                      COUNT(1) cnt
                    FROM
                      guest_book 
                    WHERE 1=1${this._whereDate({
                      endDate: param.endDate,
                      startDate: param.startDate
                    })}${this._whereStatus(param.status)}${this._whereKeys(param.search)}`;
    return this.query(syntax).then(v => +v?.[0]?.cnt || 0);
  }
}
