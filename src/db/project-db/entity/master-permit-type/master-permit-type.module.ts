import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterPermitType } from './master-permit-type.entity';
import { MasterPermitTypeRepository } from './master-permit-type.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MasterPermitType])],
  exports: [TypeOrmModule, MasterPermitTypeRepository],
  providers: [MasterPermitTypeRepository]
})
export class MasterPermitTypeDbModule {}
