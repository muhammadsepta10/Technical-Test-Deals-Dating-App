import { ApiProperty } from '@nestjs/swagger';

export class ListReasonDTO {
  @ApiProperty({ required: false })
  type: number;
}

export interface MasterScriptDTO {
  [key: string]: {
    title: string;
    banner: string;
    body: string;
    html_template: string;
  };
}
