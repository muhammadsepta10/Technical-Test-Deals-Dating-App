import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterPermissionCategory } from './master-permission-category.entity';
import { MasterPermissionCategoryRepository } from './master-permission-category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MasterPermissionCategory])],
  exports: [TypeOrmModule, MasterPermissionCategoryRepository],
  providers: [MasterPermissionCategoryRepository]
})
export class MasterPermissionCategoryDbModule {}
