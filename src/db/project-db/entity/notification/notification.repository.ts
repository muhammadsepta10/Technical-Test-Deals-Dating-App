import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationRepository extends Repository<Notification> {
  constructor(private dataSource: DataSource) {
    super(Notification, dataSource.createEntityManager());
  }
}
