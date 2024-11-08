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
  username: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  media: string;
  @ApiProperty({ required: false })
  version?: string;
  @ApiProperty({ required: false })
  device: DeviceDto;
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
