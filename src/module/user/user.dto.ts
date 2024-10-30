import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDTO {
  @ApiProperty()
  accessId: number;
  @ApiProperty()
  appId: number;
  @ApiProperty()
  username: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  password: string;
}
export class EmployeeDTO {
  @ApiProperty()
  employeId: string;
  @ApiProperty()
  nip: string;
  @ApiProperty()
  departementId: string;
  @ApiProperty()
  departement: string;
  @ApiProperty()
  section: string;
  @ApiProperty()
  position: string;
  @ApiProperty()
  name: string;
}

export class RegisterDTO {
  createdById?: number;
  @ApiProperty()
  employe?: EmployeeDTO;
  @ApiProperty()
  name: string;
  @ApiProperty()
  username: string;
  @ApiProperty()
  accessId: number;
  @ApiProperty()
  appId: number;
  @ApiProperty()
  password: string;
  @ApiProperty({ description: '1->employee, 2->not employee' })
  type: 1 | 2;
}
