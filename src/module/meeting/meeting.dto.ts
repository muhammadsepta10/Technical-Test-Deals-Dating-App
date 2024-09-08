import { ApiProperty } from '@nestjs/swagger';

export class ParticipantMeetingDTO {
  @ApiProperty({ required: false })
  userId: string;
  @ApiProperty({ required: false })
  name: string;
  @ApiProperty({ required: false })
  email: string;
  @ApiProperty({ required: false })
  waNo: string;
  @ApiProperty({ required: false })
  instanceName: string;
}

export class SubmitMeetingDTO {
  @ApiProperty()
  meetingName: string;
  @ApiProperty()
  location: string;
  @ApiProperty({ description: 'penanggung jawab meeting' })
  pic: string;
  @ApiProperty({ description: 'no hp' })
  picContact: string;
  @ApiProperty({ description: 'tujuan meeting' })
  purpose: string;
  @ApiProperty({ description: '1->internal, 2->external' })
  type: number;
  @ApiProperty({ description: 'Format YYYY-MM-DD HH:mm:ss' })
  startTime: string;
  @ApiProperty({ description: 'Format YYYY-MM-DD HH:mm:ss' })
  endTime: string;
  @ApiProperty({
    type: [ParticipantMeetingDTO],
    description: 'jika internal cukup isi userId saja, jika external userId 0 isi data lain'
  })
  participant: ParticipantMeetingDTO[];
}

export class CheckinDTO {
  @ApiProperty({ required: false })
  invitationNo: string;
}

export class ListMeetingDTO {
  @ApiProperty({ required: false })
  search: string;
  @ApiProperty({ required: false })
  status: number;
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  page: number;
  @ApiProperty({ required: false })
  startDate: string;
  @ApiProperty({ required: false })
  endDate: string;
}
