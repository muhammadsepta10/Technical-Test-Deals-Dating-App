import { ApiProperty } from '@nestjs/swagger';

export class SendMailDTO {
  @ApiProperty()
  email: string = '';
  @ApiProperty()
  subject: string = '';
  @ApiProperty()
  userId: number = 0;
  @ApiProperty({ required: false })
  text?: string = '';
  @ApiProperty({ required: false })
  html?: string = '';
}

export class NotifEmailDTO {
  @ApiProperty()
  receiverName: string = '';
  @ApiProperty()
  scriptName: string = '';
  @ApiProperty()
  email: string = '';
  @ApiProperty()
  userId: number = 0;
  @ApiProperty({ required: false })
  params?: string[] = [];
}
