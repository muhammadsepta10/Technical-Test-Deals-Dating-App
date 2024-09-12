import { Module } from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { MeetingController } from './meeting.controller';
import { GuestCheckinDbModule } from 'src/db/project-db/entity/guest-checkin/guest-checkin.module';
import { GuestMeetingDbModule } from 'src/db/project-db/entity/guest-meeting/guest-meeting.module';
import { GuestMeetingParticipantDbModule } from 'src/db/project-db/entity/guest-meeting-participant/guest-meeting-participant.module';
import { ProjectDbConfigModule } from '@common/config/db/project-db/config.module';
import { CommonModule } from '@common/service/common.module';
import { MailerModule } from '../mailer/mailer.module';
import { LoginSessionDbModule } from 'src/db/project-db/entity/login-session/login-session.module';
import { AppConfigModule } from '@common/config/api/config.module';
import { MasterModule } from '../master/master.module';

@Module({
  providers: [MeetingService],
  controllers: [MeetingController],
  imports: [
    GuestCheckinDbModule,
    GuestMeetingDbModule,
    GuestMeetingParticipantDbModule,
    ProjectDbConfigModule,
    CommonModule,
    MailerModule,
    LoginSessionDbModule,
    AppConfigModule,
    MasterModule
  ]
})
export class MeetingModule {}
