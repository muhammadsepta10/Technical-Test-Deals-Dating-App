import { ApiProperty } from '@nestjs/swagger';

export class requestGuestDTO {
  @ApiProperty()
  guestName: string;
  @ApiProperty()
  instanceName: string;
  @ApiProperty()
  guestWaNo: string;
  @ApiProperty()
  guestEmail: string;
  @ApiProperty()
  pic: string;
  @ApiProperty()
  purpose: string;
  @ApiProperty()
  instanceCategoryId: number;
  @ApiProperty()
  workUnitId: number;
  @ApiProperty()
  startTime: string;
  @ApiProperty()
  endTime: string;
}

export class approveGuestDTO {
  @ApiProperty()
  guestBookId: string;
  @ApiProperty()
  status: number;
}
