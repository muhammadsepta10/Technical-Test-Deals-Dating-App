import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterScript } from './master-script.entity';
import { MasterScriptRepository } from './master-script.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MasterScript])],
  exports: [TypeOrmModule, MasterScriptRepository],
  providers: [MasterScriptRepository]
})
export class MasterScriptDbModule {}
