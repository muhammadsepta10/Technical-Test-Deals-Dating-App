import { ApiProperty } from '@nestjs/swagger';

export class ListReasonDTO {
  @ApiProperty({ required: false })
  type: number;
}
