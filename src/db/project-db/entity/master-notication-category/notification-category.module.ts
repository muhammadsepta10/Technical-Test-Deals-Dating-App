import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterNotificationCategory } from './notification-category.entity';
import { MasterNotificationCategoryRepository } from './notification-category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MasterNotificationCategory])],
  exports: [TypeOrmModule, MasterNotificationCategoryRepository],
  providers: [MasterNotificationCategoryRepository]
})
export class MasterNotificationCategoryDbModule {}
