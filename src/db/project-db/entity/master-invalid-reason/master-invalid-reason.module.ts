import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterInvalidReason } from './master-invalid-reason.entity';
import { MasterInvalidReasonRepository } from './master-invalid-reason.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MasterInvalidReason])],
  exports: [TypeOrmModule, MasterInvalidReasonRepository],
  providers: [MasterInvalidReasonRepository]
})
export class MasterInvalidReasonModule {}
