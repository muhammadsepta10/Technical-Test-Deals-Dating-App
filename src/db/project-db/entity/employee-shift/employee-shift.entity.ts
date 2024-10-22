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
import { Shift } from '../shift/shift.entity';

@Entity('employee_shift')
@Unique(['employeeId', 'shiftId'])
export class EmployeeShift {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    type: 'int',
    generated: 'increment',
    default: null,
    nullable: true,
    unique: true
  })
  sortId: number;

  @ManyToOne(() => UserEmployee, employee => employee.id)
  employee: UserEmployee;
  @Column({ type: 'int', nullable: true, default: null })
  employeeId: number;

  @ManyToOne(() => Shift, shift => shift.id)
  shift: Shift;
  @Column({ type: 'int', nullable: true, default: null })
  shiftId: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uuid: string;

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
