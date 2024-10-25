import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { EmployeeShift } from './employee-shift.entity';
import { ShiftPerUserDTO } from 'src/module/attendance/attendance.dto';

@Injectable()
export class EmployeeShiftRepository extends Repository<EmployeeShift> {
  constructor(private dataSource: DataSource) {
    super(EmployeeShift, dataSource.createEntityManager());
  }

  private _whereDate(date: string) {
    return date ? ` AND DATE(shift."date") = '${date}'` : '';
  }

  private _listShiftType(type: number) {
    return type == 1 ? ' AND date(shift."date")<=CURRENT_DATE' : '';
  }

  async shiftPerUser(userId: number, para: ShiftPerUserDTO) {
    const query = `SELECT
	to_char(shift.start_time, 'HH24:MI:SS') "startTime",
	to_char(shift.end_time, 'HH24:MI:SS') "endTime",
	shift.is_apel "isApel",
	to_char(shift."date",'YYYY-MM-DD') "shiftDate",
	coalesce(to_char(shift.start_time_apel, 'HH24:MI:SS'),'') "startTimeApel",
	coalesce(to_char(shift.end_time_apel, 'HH24:MI:SS'),'') "endTimeApel",
	coalesce(to_char(attendance.check_in, 'YYYY-MM-DD HH24:MI:SS'), '') "checkInTime",
	coalesce(to_char(attendance.check_out, 'YYYY-MM-DD HH24:MI:SS'), '') "checkOutTime",
	coalesce(attendance.latitude_in, '') "latitudeIn",
	COALESCE(attendance.latitude_out, '') "latitudeOut",
	concat('shift ', shift.shift_type) "shiftType",
	(
		CASE WHEN user_employee.status = 1 THEN
			'clock in'
		WHEN user_employee.status = 2 THEN
			'clock out'
		WHEN user_employee.status = 3 THEN
			'Apel in'
		WHEN user_employee.status = 4 THEN
			'Apel out'
		ELSE
			'' END) "statusText",
		COALESCE(attendance.status,0) status
	FROM
		employee_shift
		JOIN user_employee ON employee_shift. "employeeId" = user_employee.id
		JOIN shift ON employee_shift. "shiftId" = shift.id
		LEFT JOIN attendance ON employee_shift.id = attendance. "shiftId"
  WHERE user_employee."userId" = $1${this._whereDate(para.date)}${this._listShiftType(para.type)}
    `;
    return this.query(query, [userId]);
  }
}
