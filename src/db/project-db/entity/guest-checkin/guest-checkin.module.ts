import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestCheckin } from './guest-checkin.entity';
import { GuestCheckinRepository } from './guest-checkin.repository';

@Module({
  imports: [TypeOrmModule.forFeature([GuestCheckin])],
  exports: [TypeOrmModule, GuestCheckinRepository],
  providers: [GuestCheckinRepository]
})
export class GuestCheckinDbModule {}
