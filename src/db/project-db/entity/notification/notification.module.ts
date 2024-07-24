import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { NotificationRepository } from './notification.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  exports: [TypeOrmModule, NotificationRepository],
  providers: [NotificationRepository]
})
export class NotificationDbModule {}
