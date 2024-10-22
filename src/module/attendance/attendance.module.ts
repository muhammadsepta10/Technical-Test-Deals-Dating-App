import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceDbModule } from 'src/db/project-db/entity/attendance/attendance.module';
import { AttendanceStatusDetDbModule } from 'src/db/project-db/entity/attendance-status-det/attendance-status-det.module';
import { AttendanceStatusPenaltyDbModule } from 'src/db/project-db/entity/attendance-status-penalty/attendance-status-penalty.module';
import { UserEmployeeModule } from 'src/db/project-db/entity/user-employee/user-employee.module';
import { AttendanceStatusDbModule } from 'src/db/project-db/entity/attendance-status/attendance-status.module';
import { EmployeeShiftModule } from 'src/db/project-db/entity/employee-shift/employee-shift.module';
import { CommonModule } from '@common/service/common.module';
import { LoginSessionDbModule } from 'src/db/project-db/entity/login-session/login-session.module';
import { ShiftDbModule } from 'src/db/project-db/entity/shift/shift.module';
import { ProjectDbConfigModule } from '@common/config/db/project-db/config.module';
import { UserModule } from '../user/user.module';

@Module({
  providers: [AttendanceService],
  controllers: [AttendanceController],
  imports: [
    AttendanceDbModule,
    AttendanceStatusDetDbModule,
    AttendanceStatusPenaltyDbModule,
    UserEmployeeModule,
    AttendanceStatusDbModule,
    EmployeeShiftModule,
    CommonModule,
    LoginSessionDbModule,
    ShiftDbModule,
    ProjectDbConfigModule,
    UserModule
  ]
})
export class AttendanceModule {}
