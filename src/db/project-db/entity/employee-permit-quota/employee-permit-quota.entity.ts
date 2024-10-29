import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn
} from 'typeorm';
import { UserEmployee } from '../user-employee/user-employee.entity';
import { MasterPermitType } from '../master-permit-type/master-permit-type.entity';

@Entity('employee_permit_quota')
@Unique(['year', 'employeeId', 'masterPermitTypeId'])
export class EmployeePermitQuota {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uuid: string;

  @Column({
    type: 'int',
    generated: 'increment',
    default: null,
    nullable: true
  })
  sortId: number;

  @ManyToOne(() => UserEmployee, employee => employee.id)
  employee: UserEmployee;
  @Column({ type: 'int', nullable: true, default: null })
  employeeId: number;

  @ManyToOne(() => MasterPermitType, permitType => permitType.id)
  masterPermitType: MasterPermitType;
  @Column({ type: 'int', nullable: true, default: null })
  masterPermitTypeId: number;

  @Column({ type: 'varchar', default: null, nullable: true })
  year: string;

  @Column({
    type: 'int',
    default: 0,
    nullable: true,
    comment: '-1 = unlimited quota'
  })
  quota: number;

  @Column({
    type: 'smallint',
    width: 3,
    default: 0,
    comment: '0->inactive, 2->on verif, 1->active',
    nullable: true
  })
  status: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)'
  })
  created_at: string;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)'
  })
  updated_at: string;
}
