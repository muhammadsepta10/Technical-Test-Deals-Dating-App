import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterAppRepository } from './master-app.repository';
import { MasterApp } from './master-app.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MasterApp])],
  exports: [TypeOrmModule, MasterAppRepository],
  providers: [MasterAppRepository]
})
export class MasterAppDbModule {}
