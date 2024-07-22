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
