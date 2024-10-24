import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceStatusDetRepository } from 'src/db/project-db/entity/attendance-status-det/attendance-status-det.repository';
import { AttendanceStatusPenaltyRepository } from 'src/db/project-db/entity/attendance-status-penalty/attendance-status-penalty.repository';
import { AttendanceStatusRepository } from 'src/db/project-db/entity/attendance-status/attendance-status.repository';
import { AttendanceRepository } from 'src/db/project-db/entity/attendance/attendance.repository';
import { EmployeeShiftRepository } from 'src/db/project-db/entity/employee-shift/employee-shift.repository';
import { UserEmployeeRepository } from 'src/db/project-db/entity/user-employee/user-employee.repository';
import {
  AbsentDTO,
  AbsentHistoryDTO,
  AddEmployeeShiftBulkDTO,
  AddEmployeeShiftDTO,
  ListShiftDTO,
  ShiftCheckDTO,
  ShiftPerUserDTO
} from './attendance.dto';
import { ShiftRepository } from 'src/db/project-db/entity/shift/shift.repository';
import { ProjectDbConfigService } from '@common/config/db/project-db/config.service';
import { QueryRunner } from 'typeorm';
import { UserService } from '../user/user.service';
import { CommonService } from '@common/service/common.service';
import * as dayJs from 'dayjs';

@Injectable()
export class AttendanceService {
  constructor(
    private projectDbConfigService: ProjectDbConfigService,
    private userService: UserService,
    private commonService: CommonService
  ) {}
  @InjectRepository(AttendanceRepository)
  private attendanceRepository: AttendanceRepository;
  @InjectRepository(AttendanceStatusRepository)
  private attendanceStatusRepository: AttendanceStatusRepository;
  @InjectRepository(AttendanceStatusDetRepository)
  private attendanceStatusDetRepository: AttendanceStatusDetRepository;
  @InjectRepository(AttendanceStatusPenaltyRepository)
  private attendanceStatusPenaltyRepository: AttendanceStatusPenaltyRepository;
  @InjectRepository(EmployeeShiftRepository)
  private employeeShiftRepository: EmployeeShiftRepository;
  @InjectRepository(UserEmployeeRepository)
  private userEmployeeRepository: UserEmployeeRepository;
  @InjectRepository(ShiftRepository)
  private shiftRepository: ShiftRepository;

  private async _shift(param: ShiftCheckDTO, queryRunner: QueryRunner) {
    const { cabangId, date, shift: shiftType, endTime, startTime, userId, endTimeApel, startTimeApel, isApel } = param;
    let shift = await this.shiftRepository
      .createQueryBuilder('shift')
      .where('shift.date = :date AND shift.cabangId = :cabangId AND shift.shift_type = :shiftType', {
        date,
        cabangId,
        shiftType
      })
      .setQueryRunner(queryRunner)
      .select([
        'shift.id',
        'shift.start_time',
        'shift.end_time',
        'shift.cabangId',
        'shift.date',
        'shift.start_time_apel',
        'shift.end_time_apel'
      ])
      .getOne();
    const existShift = shift ? true : false;
    if (!shift) {
      shift = await this.shiftRepository
        .createQueryBuilder('shift')
        .setQueryRunner(queryRunner)
        .insert()
        .values({
          cabangId,
          shift_type: shiftType,
          date,
          start_time: startTime,
          end_time: endTime,
          status: 1,
          createdById: userId,
          start_time_apel: startTimeApel,
          end_time_apel: endTimeApel,
          is_apel: isApel
        })
        .returning(['shift.id', 'shift.start_time', 'shift.end_time', 'shift.cabangId', 'shift.date'])
        .execute()
        .then(v => v?.raw[0]);
    }
    return { shift, existShift };
  }

  private async _employee(param: { employeeId: string; shiftId: number }, queryRunner: QueryRunner) {
    const { employeeId, shiftId } = param;
    const employee = await this.userEmployeeRepository
      .createQueryBuilder('userEmployee')
      .where('userEmployee.uuid = :employeeId', { employeeId })
      .setQueryRunner(queryRunner)
      .select(['userEmployee.id'])
      .getOne();
    if (!employee) {
      throw new BadRequestException('Invalid Employee');
    }
    let employeeShift = await this.employeeShiftRepository
      .createQueryBuilder('employeeShift')
      .where('employeeShift.shiftId = :shiftId AND employeeShift.employeeId = :employeeId', {
        shiftId,
        employeeId: employee.id
      })
      .select(['employeeShift.id'])
      .setQueryRunner(queryRunner)
      .getOne();
    const existEmployeeShift = employeeShift ? true : false;
    if (!employeeShift) {
      employeeShift = await this.employeeShiftRepository
        .createQueryBuilder('employeeShift')
        .insert()
        .values({
          shiftId,
          employeeId: employee.id
        })
        .setQueryRunner(queryRunner)
        .returning(['userEmployee.id'])
        .execute()
        .then(v => v.raw[0]);
    }
    return { employeeShiftId: employeeShift.id, existEmployeeShift };
  }

  async listAbsent(param: AbsentHistoryDTO, userId: number) {
    const { yearMonth, limit, page } = param;
    // yearMonth = dayJs(yearMonth, "YYYY-MM").format();
    const data = await this.attendanceRepository.find({
      where: {
        created_at: yearMonth,
        id: limit,
        shiftId: page,
        employeeId: userId
      }
    });
    return data;
  }

  async shiftPerUser(param: ShiftPerUserDTO, userId: number) {
    const userPerShift = await this.employeeShiftRepository.shiftPerUser(userId, param);
    return userPerShift;
  }

  async absent(param: AbsentDTO, userId: number) {
    // const { LATE_HOUR } = await this.commonService.generalParameter();
    const { latitude, longitude } = param;
    const user = await this.userService.getMe(userId);
    if (!user?.employeeId) {
      throw new BadRequestException('User is Not Employee');
    }
    const shift = await this.employeeShiftRepository
      .createQueryBuilder('employeeShift')
      .innerJoinAndSelect('employeeShift.employee', 'employee')
      .innerJoinAndSelect('employeeShift.shift', 'shift')
      .where('employee.uuid = :employeeId AND shift.date = :currenDate', {
        employeeId: user.employeeId,
        currenDate: dayJs().format('YYYY-MM-DD')
      })
      .select([
        'employeeShift.id',
        'shift.id',
        'employee.id',
        'shift.date',
        'shift.start_time',
        'shift.end_time',
        'shift.start_time_apel',
        'shift.end_time_apel'
      ])
      .getOne();
    const attendance = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.shiftId = :shiftId', { shiftId: shift.id })
      .select(['attendance.id'])
      .getOne();
    const inOut = !attendance ? 1 : 0;
    if (attendance) {
      // clock out
      await this.attendanceRepository
        .createQueryBuilder('attendance')
        .update()
        .set({
          longtitude_out: longitude,
          latitude_out: latitude,
          check_out: dayJs().format('YYYY-MM-DD HH:mm:ss'),
          status: 1
        })
        .where('attendance.id = :id', { id: attendance.id })
        .execute();
    }
    if (!attendance) {
      // clockIn
      await this.attendanceRepository
        .createQueryBuilder('attendance')
        .insert()
        .values({
          longtitude_in: longitude,
          latitude_in: latitude,
          check_in: dayJs().format('YYYY-MM-DD HH:mm:ss'),
          shiftId: shift.id,
          employeeId: shift.employee.id
        })
        .execute();
    }
    return { message: inOut ? 'Success Clockin' : 'Success Clockout' };
  }

  async addEmployeeShift(param: AddEmployeeShiftDTO, userId: number, queryRunner?: QueryRunner) {
    const {
      cabangId,
      date,
      employeeId,
      endTime,
      shift: shiftType,
      startTime,
      isApel,
      endTimeApel,
      startTimeApel
    } = param;
    if (!queryRunner) {
      const dataSource = await this.projectDbConfigService.dbConnection();
      queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
    }
    try {
      const { shift } = await this._shift(
        {
          cabangId,
          date,
          endTime,
          startTime,
          shift: shiftType,
          userId,
          endTimeApel,
          startTimeApel,
          isApel
        },
        queryRunner
      );
      const { existEmployeeShift } = await this._employee({ employeeId, shiftId: shift.id }, queryRunner);
      if (existEmployeeShift) {
        throw new BadRequestException('Shift for this employee is already assigned');
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (!error?.response || !error?.status) {
        throw new InternalServerErrorException(error);
      }
      throw new HttpException(error?.response, error?.status);
    } finally {
      await queryRunner.release();
    }
  }

  async addEmployeeShiftBulk(param: AddEmployeeShiftBulkDTO, userId: number) {
    const {
      cabangId,
      date,
      employeeIds,
      endTime,
      shift: shiftType,
      startTime,
      isApel,
      endTimeApel,
      startTimeApel
    } = param;
    const dataSource = await this.projectDbConfigService.dbConnection();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { shift } = await this._shift(
        {
          cabangId,
          date,
          endTime,
          startTime,
          shift: shiftType,
          userId,
          endTimeApel,
          startTimeApel,
          isApel
        },
        queryRunner
      );
      for (let index = 0; index < employeeIds.length; index++) {
        const employeeId = employeeIds[index];
        await this._employee({ employeeId, shiftId: shift.id }, queryRunner);
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (!error?.response || !error?.status) {
        throw new InternalServerErrorException(error);
      }
      throw new HttpException(error?.response, error?.status);
    } finally {
      await queryRunner.release();
    }
  }

  async importEmployeeShift(params: AddEmployeeShiftDTO[], userId: number) {
    const dataSource = await this.projectDbConfigService.dbConnection();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (let index = 0; index < params.length; index++) {
        const param = params[index];
        await this.addEmployeeShift(param, userId, queryRunner);
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (!error?.response || !error?.status) {
        throw new InternalServerErrorException(error);
      }
      throw new HttpException(error?.response, error?.status);
    } finally {
      await queryRunner.release();
    }
  }

  async listShift(param: ListShiftDTO) {
    const list = await this.shiftRepository.list(param);
    const cnt = await this.shiftRepository.cnt(param);
    return {
      raw: list,
      totalData: cnt,
      totalPage: Math.ceil(cnt / param.limit)
    };
  }
}
