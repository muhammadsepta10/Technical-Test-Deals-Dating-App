import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { GuestCheckin } from './guest-checkin.entity';

@Injectable()
export class GuestCheckinRepository extends Repository<GuestCheckin> {
  constructor(private dataSource: DataSource) {
    super(GuestCheckin, dataSource.createEntityManager());
  }
}
