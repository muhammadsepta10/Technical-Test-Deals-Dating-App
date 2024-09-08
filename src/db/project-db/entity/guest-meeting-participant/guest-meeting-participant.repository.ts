import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { GuestMeetingParticipant } from './guest-meeting-participant.entity';

@Injectable()
export class GuestMeetingParticipantRepository extends Repository<GuestMeetingParticipant> {
  constructor(private dataSource: DataSource) {
    super(GuestMeetingParticipant, dataSource.createEntityManager());
  }
}
