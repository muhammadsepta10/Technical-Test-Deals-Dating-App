import { ApiProperty } from '@nestjs/swagger';

export class ListMediaDTO {
  @ApiProperty({ required: false })
  search: string;
  @ApiProperty({ required: false })
  status: number;
  @ApiProperty({ required: false })
  limit: number;
  @ApiProperty({ required: false })
  skip: number;
}

export class ApproveMediaDTO {
  @ApiProperty()
  mediaId: string;
  @ApiProperty({ description: '1->approved, 2->rejected' })
  status: number;
  @ApiProperty({ required: false })
  reasonId: number;
}

export class ProcessApprovedMediaDTO {
  status: number;
  mediaName: string;
  userJournalId: number;
  reasonName: string;
  userJournalEmail: string;
  userId: number;
  reasonId: number;
}
