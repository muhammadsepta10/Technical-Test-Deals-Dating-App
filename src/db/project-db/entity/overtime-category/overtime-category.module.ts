import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OvertimeCategory } from './overtime-category.entity';
import { OvertimeCategoryRepository } from './overtime-category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([OvertimeCategory])],
  exports: [TypeOrmModule, OvertimeCategoryRepository],
  providers: [OvertimeCategoryRepository]
})
export class OvertimeCategoryDbModule {}
