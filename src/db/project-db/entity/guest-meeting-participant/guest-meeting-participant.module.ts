import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestMeetingParticipant } from './guest-meeting-participant.entity';
import { GuestMeetingParticipantRepository } from './guest-meeting-participant.repository';

@Module({
  imports: [TypeOrmModule.forFeature([GuestMeetingParticipant])],
  exports: [TypeOrmModule, GuestMeetingParticipantRepository],
  providers: [GuestMeetingParticipantRepository]
})
export class GuestMeetingParticipantDbModule {}
