import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterNewsCategory } from './master-news-category.entity';
import { MasterNewsCategoryRepository } from './master-news-category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MasterNewsCategory])],
  exports: [TypeOrmModule, MasterNewsCategoryRepository],
  providers: [MasterNewsCategoryRepository]
})
export class MasterNewsCategoryModule {}
