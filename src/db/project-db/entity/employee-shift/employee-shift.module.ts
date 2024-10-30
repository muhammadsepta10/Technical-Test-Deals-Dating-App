import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeShift } from './employee-shift.entity';
import { EmployeeShiftRepository } from './employee-shift.repository';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeShift])],
  exports: [TypeOrmModule, EmployeeShiftRepository],
  providers: [EmployeeShiftRepository]
})
export class EmployeeShiftModule {}
