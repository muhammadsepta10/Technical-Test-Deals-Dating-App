import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestMeeting } from './guest-meeting.entity';
import { GuestMeetingRepository } from './guest-meeting.repository';

@Module({
  imports: [TypeOrmModule.forFeature([GuestMeeting])],
  exports: [TypeOrmModule, GuestMeetingRepository],
  providers: [GuestMeetingRepository]
})
export class GuestMeetingDbModule {}
