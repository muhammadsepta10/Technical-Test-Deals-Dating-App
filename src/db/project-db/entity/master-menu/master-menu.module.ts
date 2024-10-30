import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterMenu } from './master-menu.entity';
import { MasterMenuRepository } from './master-menu.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MasterMenu])],
  exports: [TypeOrmModule, MasterMenuRepository],
  providers: [MasterMenuRepository]
})
export class MasterMenuDbModule {}
