import { TransformInterceptor } from '@common/interceptor/transform.interceptor';
import { Body, Controller, Get, Param, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { MeetingService } from './meeting.service';
import { CheckinPipe, ListMeetingPipe, SubmitMeetingPipe } from './meeting.pipe';
import { CheckinDTO, ListMeetingDTO, SubmitMeetingDTO } from './meeting.dto';
import { User } from '@common/decorators/param.user.decorator';
import { AuthGuard } from '@common/guards/auth.guard';

@Controller('/api/meeting')
@ApiTags('meeting')
@ApiSecurity('auth')
@ApiSecurity('appAuth')
@UseInterceptors(TransformInterceptor)
export class MeetingController {
  constructor(private meetingService: MeetingService) {}

  @Post('/')
  @UseGuards(AuthGuard)
  submitMeeting(@Body(SubmitMeetingPipe) param: SubmitMeetingDTO, @User() user) {
    return this.meetingService.submitMeeting(param, user);
  }

  @Post('/checkin')
  checkin(@Body(CheckinPipe) param: CheckinDTO) {
    return this.meetingService.checkin(param);
  }

  @Get('/')
  @UseGuards(AuthGuard)
  listMeeting(@Query(ListMeetingPipe) param: ListMeetingDTO) {
    return this.meetingService.listMeeting(param);
  }

  @Get('/:id')
  detailMeeting(@Param('id') id: string) {
    return this.meetingService.detailMeeting(id);
  }

  @Get('/participant/:id')
  participantDetail(@Param('id') id: string) {
    return this.meetingService.participantDetail(id);
  }
}
