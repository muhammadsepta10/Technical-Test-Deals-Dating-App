import { ApiProperty } from '@nestjs/swagger';

export class AbsentDTO {
  @ApiProperty()
  latitude: string;
  @ApiProperty()
  longitude: string;
  @ApiProperty()
  outRange: number;
}

export class AbsentHistoryDTO {
  @ApiProperty()
  yearMonth: string;
  @ApiProperty({ required: false, default: 1 })
  page: number;
  @ApiProperty({ required: false, default: 10 })
  limit: number;
}

export interface ShiftCheckDTO {
  cabangId: number;
  shift: number;
  date: string;
  startTime: string;
  endTime: string;
  startTimeApel: string;
  endTimeApel: string;
  userId: number;
  isApel: number;
}

export class AddEmployeeShiftDTO {
  @ApiProperty()
  cabangId: number;
  @ApiProperty()
  shift: number;
  @ApiProperty()
  date: string;
  @ApiProperty()
  isApel: number;
  @ApiProperty()
  employeeId: string;
  @ApiProperty()
  startTime: string;
  @ApiProperty()
  endTime: string;
  @ApiProperty()
  startTimeApel: string;
  @ApiProperty()
  endTimeApel: string;
}

export class AddEmployeeShiftBulkDTO {
  @ApiProperty()
  cabangId: number;
  @ApiProperty()
  shift: number;
  @ApiProperty()
  date: string;
  @ApiProperty()
  isApel: number;
  @ApiProperty()
  startTime: string;
  @ApiProperty()
  endTime: string;
  @ApiProperty()
  startTimeApel: string;
  @ApiProperty()
  endTimeApel: string;
  @ApiProperty()
  employeeIds: string[];
}

export class ListShiftDTO {
  @ApiProperty({ required: false })
  cabangId: number;
  @ApiProperty({ required: false })
  date: string;
  @ApiProperty({ required: false })
  shift: number;
  @ApiProperty({ required: false, default: 1 })
  page: number;
  @ApiProperty({ required: false, default: 10 })
  limit: number;
}
