import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterCabang } from './master-cabang.entity';
import { MasterCabangRepository } from './master-cabang.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MasterCabang])],
  exports: [TypeOrmModule, MasterCabangRepository],
  providers: [MasterCabangRepository]
})
export class MasterCabangDbModule {}
