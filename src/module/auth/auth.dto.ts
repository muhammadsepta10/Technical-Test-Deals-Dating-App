import { ApiProperty } from '@nestjs/swagger';

export class DeviceDto {
  @ApiProperty({ required: false })
  imei: string;
  @ApiProperty({ required: false })
  devicetype: string;
  @ApiProperty({ required: false })
  language: string;
  @ApiProperty({ required: false })
  manufacturer: string;
  @ApiProperty({ required: false })
  model: string;
  @ApiProperty({ required: false })
  os: string;
  @ApiProperty({ required: false })
  osVersion: string;
  @ApiProperty({ required: false })
  region: string;
  @ApiProperty({ required: false })
  sdkVersion: string;
  @ApiProperty({ required: false })
  heightdips: number;
  @ApiProperty({ required: false })
  heightpixels: number;
  @ApiProperty({ required: false })
  scale: number;
  @ApiProperty({ required: false })
  widthdips: number;
  @ApiProperty({ required: false })
  widthpixels: number;
  @ApiProperty({ required: false })
  player_id: string;
  @ApiProperty({ required: false })
  firebase_id: string;
}
export class LoginDTO {
  @ApiProperty()
  journalist_id: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  media: string;
  @ApiProperty({ required: false })
  version?: string;
  @ApiProperty({ required: false })
  device: DeviceDto;
}

export class DocumentDTO {
  @ApiProperty()
  id: number;
  @ApiProperty()
  file: string;
  @ApiProperty()
  name: string;
}
export class RegisterDTO {
  @ApiProperty({ required: true })
  media_name: string;
  @ApiProperty({ required: true })
  whatsapp_no: string;
  @ApiProperty({ required: true })
  email: string;
  @ApiProperty({ required: true })
  address: string;
  @ApiProperty({ required: true })
  bankId: number;
  @ApiProperty({ required: true })
  account_no: number;
  @ApiProperty({ required: true })
  pers_card_no: string;
  @ApiProperty()
  npwp: string;
  @ApiProperty()
  instagram_link: string;
  @ApiProperty()
  facebook_link: string;
  @ApiProperty()
  x_link: string;
  @ApiProperty()
  tiktok_link: string;
  @ApiProperty()
  youtube_link: string;
  @ApiProperty()
  website_link: string;
  @ApiProperty()
  podcast_link: string;
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' }, description: 'Files' })
  files: Express.Multer.File[];
}

export class ReqOtpDTO {
  @ApiProperty()
  email: string;
}

export class ValidateOtpDTO {
  @ApiProperty()
  email: string;
  @ApiProperty()
  otp: string;
}

export class ReviewTenderDTO {
  @ApiProperty()
  status: number;
  @ApiProperty()
  tenderSubmissionId: string;
  @ApiProperty()
  reasonId: number;
  @ApiProperty({ required: false })
  notes: string;
  @ApiProperty({ required: false })
  documentReview: string;
}

export class ReviewTenderSubmissionDTO {
  @ApiProperty()
  status: number;
  @ApiProperty()
  tenderSubmissionId: string;
  @ApiProperty({ required: false })
  notes: string;
}
