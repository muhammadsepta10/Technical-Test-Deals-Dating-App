import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterWorkUnit } from './master-work-unit.entity';
import { MasterWorkUnitRepository } from './master-work-unit.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MasterWorkUnit])],
  exports: [TypeOrmModule, MasterWorkUnitRepository],
  providers: [MasterWorkUnitRepository]
})
export class MasterWorkUnitDbModule {}
