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
  PermitDTO,
  PermitListDTO,
  ShiftCheckDTO,
  ShiftPerUserDTO
} from './attendance.dto';
import { ShiftRepository } from 'src/db/project-db/entity/shift/shift.repository';
import { ProjectDbConfigService } from '@common/config/db/project-db/config.service';
import { QueryRunner } from 'typeorm';
import { UserService } from '../user/user.service';
import { CommonService } from '@common/service/common.service';
import * as dayJs from 'dayjs';
import { PermitRepository } from 'src/db/project-db/entity/permit/permit.repository';
import { PermitDocumentRepository } from 'src/db/project-db/entity/permit-document/permit-document.repository';
import { EmployeePermitQuotaRepository } from 'src/db/project-db/entity/employee-permit-quota/employee-permit-quota.repository';
import { MasterPermissionCategoryRepository } from 'src/db/project-db/entity/master-permission-category/master-permission-category.repository';
import { AppConfigService } from '@common/config/api/config.service';

@Injectable()
export class AttendanceService {
  constructor(
    private projectDbConfigService: ProjectDbConfigService,
    private userService: UserService,
    private commonService: CommonService,
    private appConfigService: AppConfigService
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
  @InjectRepository(PermitRepository)
  private permitRepository: PermitRepository;
  @InjectRepository(PermitDocumentRepository)
  private permitDocumentRepository: PermitDocumentRepository;
  @InjectRepository(EmployeePermitQuotaRepository)
  private employeePermitQuotaRepository: EmployeePermitQuotaRepository;
  @InjectRepository(MasterPermissionCategoryRepository)
  private masterPermissionCategoryRepository: MasterPermissionCategoryRepository;

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
    const dataSource = await this.projectDbConfigService.dbConnection();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
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
        .setQueryRunner(queryRunner)
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
      if (!shift) {
        throw new BadRequestException(
          'Shift anda untuk hari ini belum di input, Hubungi Hrd untuk mengatur shift anda'
        );
      }
      const attendance = await this.attendanceRepository
        .createQueryBuilder('attendance')
        .where('attendance.shiftId = :shiftId', { shiftId: shift.id })
        .select(['attendance.id'])
        .setQueryRunner(queryRunner)
        .getOne();
      const inOut = !attendance ? 1 : 0;
      if (attendance) {
        // clock out
        await this.attendanceRepository
          .createQueryBuilder('attendance')
          .update()
          .setQueryRunner(queryRunner)
          .set({
            longtitude_out: longitude,
            latitude_out: latitude,
            check_out: dayJs().format('YYYY-MM-DD HH:mm:ss'),
            status: 2
          })
          .where('attendance.id = :id', { id: attendance.id })
          .execute();
      }
      if (!attendance) {
        // clockIn
        await this.attendanceRepository
          .createQueryBuilder('attendance')
          .insert()
          .setQueryRunner(queryRunner)
          .values({
            longtitude_in: longitude,
            latitude_in: latitude,
            check_in: dayJs().format('YYYY-MM-DD HH:mm:ss'),
            shiftId: shift.id,
            employeeId: shift.employee.id,
            status: 1
          })
          .execute();
      }
      await queryRunner.commitTransaction();
      return { message: inOut ? 'Success Clockin' : 'Success Clockout' };
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

  private async _checkQuota({
    countDays,
    permitTypeId,
    queryRunner,
    employeeId,
    updated
  }: {
    countDays: number;
    permitTypeId: number;
    queryRunner: QueryRunner;
    employeeId: number;
    updated: boolean;
  }) {
    const currentYear = dayJs().year().toString();
    const permitTypeQuota = await this.employeePermitQuotaRepository
      .createQueryBuilder('employeePermitQuota')
      .where(
        'employeePermitQuota.masterPermitTypeId = :permitId AND employeePermitQuota.employeeId = :employeeId AND employeePermitQuota.year = :currentYear',
        { permitId: permitTypeId, currentYear, employeeId }
      )
      .select(['employeePermitQuota.quota', 'employeePermitQuota.id'])
      .setQueryRunner(queryRunner)
      .getOne()
      .then(v => {
        return { quota: v?.quota || 0, id: v.id };
      });
    if (countDays > permitTypeQuota.quota) {
      throw new BadRequestException('Kuota cuti anda tidak mencukupi');
    }
    if (updated) {
      const update = await this.employeePermitQuotaRepository
        .createQueryBuilder('employeePermitQuota')
        .update()
        .set({ quota: () => `quota-${countDays}` })
        .where('id = :id AND quota >= :quota', {
          id: permitTypeQuota.id,
          quota: countDays
        })
        .setQueryRunner(queryRunner)
        .execute();
      if (update.affected < 1) {
        throw new BadRequestException('Kuota cuti anda tidak mencukupi');
      }
    }
  }

  async permit(param: PermitDTO, files: Express.Multer.File[], userId: number) {
    const dataSource = await this.projectDbConfigService.dbConnection();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { startDate, endDate, description, type, permissionCategoryId } = param;
      const employee = await this.userEmployeeRepository
        .createQueryBuilder('userEmployee')
        .where('userEmployee.userId = :userId', { userId })
        .select(['userEmployee.id'])
        .getOne();
      const permissionCategory = await this.masterPermissionCategoryRepository
        .createQueryBuilder('masterPermissionCategory')
        .where('masterPermissionCategory.id = :permissionCategoryId', {
          permissionCategoryId
        })
        .select(['masterPermissionCategory.id', 'masterPermissionCategory.code'])
        .getOne();
      if (!permissionCategory) {
        throw new BadRequestException('Invalid Permission category');
      }
      let permitTypeId = null;
      if (!employee) {
        throw new BadRequestException('Invalid Employee');
      }
      const countDays = dayJs(endDate).diff(dayJs(startDate), 'day');
      let attendanceStatusDetCode = type == 1 ? 'i' : 'c';
      if (type == 1) {
        if (permissionCategory.code == 's') {
          if (files.length < 1) {
            attendanceStatusDetCode = 'sts';
          }
          if (files.length > 0) {
            attendanceStatusDetCode = 'sds';
          }
        }
      }
      if (type == 2) {
        // cuti
        permitTypeId = param.permitTypeId;

        // check and update quota cuti
        await this._checkQuota({
          countDays,
          permitTypeId,
          queryRunner,
          employeeId: employee.id,
          updated: false
        });
      }
      const attendanceStatusDet = await this.attendanceStatusDetRepository
        .createQueryBuilder('attendanceStatusDet')
        .where('code = :code ', { code: attendanceStatusDetCode })
        .select(['attendanceStatusDet.id'])
        .getOne();
      const permit = await this.permitRepository
        .createQueryBuilder('permit')
        .insert()
        .values({
          description,
          days: countDays,
          start_date: startDate,
          end_date: endDate,
          masterPermitTypeId: permitTypeId,
          userEmployeeId: employee.id,
          status: 0,
          masterPermissionCategoryId: permissionCategoryId,
          attendanceStatusDetId: attendanceStatusDet.id,
          type,
          createdById: userId
        })
        .setQueryRunner(queryRunner)
        .returning(['id'])
        .execute();
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const urlFile = `${this.appConfigService.BASE_URL + '/permit_doc/' + file.filename}`;
        await this.permitDocumentRepository
          .createQueryBuilder('permitDocument')
          .insert()
          .values({
            permitId: permit.raw[0].id,
            document: urlFile,
            description: '',
            createdById: userId
          })
          .setQueryRunner(queryRunner)
          .execute();
      }
      await queryRunner.commitTransaction();
      return { message: 'success' };
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

  async permitList(param: PermitListDTO, userId: number) {
    const employee = await this.userEmployeeRepository
      .createQueryBuilder('userEmployee')
      .where('userEmployee.userId = :userId', { userId })
      .select(['userEmployee.id'])
      .getOne();
    const list = await this.permitRepository.list(param, employee.id);
    const cnt = await this.permitRepository.cnt(param, employee.id);
    return {
      raw: list,
      totalData: cnt,
      totalPage: Math.ceil(cnt / param.limit)
    };
  }
}
