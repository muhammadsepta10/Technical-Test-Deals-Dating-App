import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterMedia } from './master-media.entity';
import { MasterMediaRepository } from './master-media.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MasterMedia])],
  exports: [TypeOrmModule, MasterMediaRepository],
  providers: [MasterMediaRepository]
})
export class MasterMediaDbModule {}
