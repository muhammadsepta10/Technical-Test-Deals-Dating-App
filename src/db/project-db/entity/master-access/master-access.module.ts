import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterAccess } from './master-access.entity';
import { MasterAccessRepository } from './master-access.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MasterAccess])],
  providers: [MasterAccessRepository],
  exports: [TypeOrmModule, MasterAccessRepository]
})
export class MasterAccessDbModule {}
