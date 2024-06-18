import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterBank } from './master-bank.entity';
import { MasterBankRepository } from './master-bank.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MasterBank])],
  exports: [TypeOrmModule, MasterBankRepository],
  providers: [MasterBankRepository]
})
export class MasterBankModule {}
