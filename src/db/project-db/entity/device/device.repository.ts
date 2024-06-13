import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Device } from './device.entity';

@Injectable()
export class DeviceRepository extends Repository<Device> {
  constructor(private dataSource: DataSource) {
    super(Device, dataSource.createEntityManager());
  }
}
