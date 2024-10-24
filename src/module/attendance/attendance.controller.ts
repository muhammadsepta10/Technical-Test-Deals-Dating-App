import { Body, Controller, Get, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import {
  AbsentDTO,
  AbsentHistoryDTO,
  AddEmployeeShiftBulkDTO,
  AddEmployeeShiftDTO,
  ListShiftDTO,
  ShiftPerUserDTO
} from './attendance.dto';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from '@common/interceptor/transform.interceptor';
import { AuthGuard } from '@common/guards/auth.guard';
import { User } from '@common/decorators/param.user.decorator';

@Controller('/api/attendance')
@ApiTags('attendance')
@ApiSecurity('auth')
@ApiSecurity('appAuth')
@UseInterceptors(TransformInterceptor)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Get('/absent')
  @UseGuards(AuthGuard)
  async getAbsent(@Query() param: AbsentHistoryDTO, @User() userId: number) {
    return this.attendanceService.listAbsent(param, userId);
  }

  @Post('/absent')
  @UseGuards(AuthGuard)
  async absent(@Body() param: AbsentDTO, @User() userId) {
    return this.attendanceService.absent(param, userId);
  }

  @Post('/shift')
  @UseGuards(AuthGuard)
  async addEmployeeShift(@Body() param: AddEmployeeShiftDTO, @User() userId: number) {
    return this.attendanceService.addEmployeeShift(param, userId);
  }

  @Post('/shift/bulk')
  @UseGuards(AuthGuard)
  async addEmployeeShiftBulk(@Body() param: AddEmployeeShiftBulkDTO, @User() userId: number) {
    return this.attendanceService.addEmployeeShiftBulk(param, userId);
  }

  @Post('/shift/import')
  @UseGuards(AuthGuard)
  async importEmployeeShift(@Body() param: AddEmployeeShiftDTO[], @User() userId: number) {
    return this.attendanceService.importEmployeeShift(param, userId);
  }

  @Get('/shift')
  @UseGuards(AuthGuard)
  async listShift(@Query() param: ListShiftDTO) {
    return this.attendanceService.listShift(param);
  }

  @Get('/shift/user')
  @UseGuards(AuthGuard)
  async shiftPerUser(@Query() param: ShiftPerUserDTO, @User() userId) {
    return this.attendanceService.shiftPerUser(param, userId);
  }
}
