import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterInstanceCategory } from './master-instance-category.entity';
import { MasterInstanceCategoryRepository } from './master-instance-category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MasterInstanceCategory])],
  exports: [TypeOrmModule, MasterInstanceCategoryRepository],
  providers: [MasterInstanceCategoryRepository]
})
export class MasterInstanceCategoryDbModule {}
