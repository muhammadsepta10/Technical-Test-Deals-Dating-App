import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Overtime } from './overtime.entity';
import { OvertimeRepository } from './overtime.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Overtime])],
  exports: [TypeOrmModule, OvertimeRepository],
  providers: [OvertimeRepository]
})
export class OvertimeDbModule {}
