import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { UserDevice } from './user_device.entity';

@Injectable()
export class UserDeviceRepository extends Repository<UserDevice> {
  constructor(private dataSource: DataSource) {
    super(UserDevice, dataSource.createEntityManager());
  }
}
