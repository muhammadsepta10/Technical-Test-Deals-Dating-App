import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Permit } from './permit.entity';
import { PermitListDTO } from 'src/module/attendance/attendance.dto';

@Injectable()
export class PermitRepository extends Repository<Permit> {
  constructor(private dataSource: DataSource) {
    super(Permit, dataSource.createEntityManager());
  }

  private _whereStatus(status: number) {
    return status >= 0 ? ` AND permit.status = ${status}` : '';
  }

  private _whereType(type: number) {
    return type > 0 ? ` AND permit.type = ${type}` : '';
  }

  async cnt(param: PermitListDTO, employeeId: number) {
    const cnt = `SELECT COUNT(1) cnt FROM permit WHERE permit."userEmployeeId" = $1${this._whereStatus(
      param.status
    )}${this._whereType(param.type)}`;
    return this.query(cnt, [employeeId]).then(v => +v?.[0]?.cnt || 0);
  }

  async list(param: PermitListDTO, employeeId: number) {
    const skip = (param.page <= 1 ? 0 : param.page - 1) * param.limit;
    const syntax = `SELECT
  permit.uuid id,
	to_char(created_at, 'YYYY-MM-DD HH24:mi:ss') "createdAt",
	permit.days,
	to_char(permit.start_date, 'YYYY-MM-DD') "startDate",
	to_char(permit.end_date, 'YYYY-MM-DD') "endDate",
	permit.status,
	(
		CASE WHEN permit.status = 0 THEN
			'Diproses'
		WHEN permit.status = 1 THEN
			'Disetujui'
		WHEN permit.status = 2 THEN
			'Ditolak'
		ELSE
			''
		END) "statusText"
FROM
	permit
WHERE
  permit."userEmployeeId" = $1${this._whereStatus(
    param.status
  )}${this._whereType(param.type)} LIMIT ${param.limit} OFFSET ${skip}`;
    return this.query(syntax, [employeeId]);
  }
}
