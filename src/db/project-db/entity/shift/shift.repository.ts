import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Shift } from './shift.entity';
import { RespListShiftDTO } from './shift.dto';
import { ListShiftDTO } from 'src/module/attendance/attendance.dto';

@Injectable()
export class ShiftRepository extends Repository<Shift> {
  constructor(private dataSource: DataSource) {
    super(Shift, dataSource.createEntityManager());
  }

  private _whereDate(date: string) {
    return date ? ` AND DATE(shift.date) = '${date}'` : '';
  }

  private _whereShift(shift: number) {
    return shift > 0 ? ` AND shift.shift = ${shift}` : '';
  }

  private _whereCabang(cabangId: number) {
    return cabangId > 0 ? ` AND shift."cabangId" = ${cabangId}` : '';
  }

  async cnt(param: ListShiftDTO): Promise<number> {
    const syntax = `SELECT count(1) cnt from shift,master_cabang where shift."cabangId" = master_cabang.id${this._whereDate(
      param?.date
    )}${this._whereShift(param.shift)}${this._whereCabang(param.cabangId)}`;
    return this.query(syntax).then(v => +v?.[0]?.cnt || 0);
  }

  async list(param: ListShiftDTO): Promise<RespListShiftDTO[]> {
    const skip = (param.page <= 1 ? 0 : param.page - 1) * param.limit;
    const syntax = `SELECT master_cabang."name" "cabang",shift.uuid "shiftId",concat('shift ',shift.shift_type) "shift",shift.start_time "startTime",shift.end_time "endTime",shift.status "status" from shift,master_cabang where shift."cabangId" = master_cabang.id${this._whereDate(
      param?.date
    )}${this._whereShift(param.shift)}${this._whereCabang(param.cabangId)} LIMIT ${param.limit} OFFSET ${skip}`;
    return this.query(syntax);
  }
}
