import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeePermitQuota } from './employee-permit-quota.entity';
import { EmployeePermitQuotaRepository } from './employee-permit-quota.repository';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeePermitQuota])],
  exports: [TypeOrmModule, EmployeePermitQuotaRepository],
  providers: [EmployeePermitQuotaRepository]
})
export class EmployeePermitQuotaModule {}
