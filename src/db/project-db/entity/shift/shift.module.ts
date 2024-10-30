import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shift } from './shift.entity';
import { ShiftRepository } from './shift.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Shift])],
  exports: [TypeOrmModule, ShiftRepository],
  providers: [ShiftRepository]
})
export class ShiftDbModule {}
