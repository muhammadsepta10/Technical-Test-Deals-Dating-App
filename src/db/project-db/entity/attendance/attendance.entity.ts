import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  OneToOne,
  JoinColumn
} from 'typeorm';
import { User } from '../user/user.entity';
import { UserEmployee } from '../user-employee/user-employee.entity';
import { EmployeeShift } from '../employee-shift/employee-shift.entity';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uniqueId: string;

  @OneToOne(() => EmployeeShift, employeeShift => employeeShift.id)
  @JoinColumn()
  shift: EmployeeShift;
  @Column({ default: null, nullable: true })
  shiftId: number;

  @ManyToOne(() => UserEmployee, userEmployee => userEmployee.id)
  employee: UserEmployee;
  @Column({ type: 'int4', nullable: true, default: null })
  employeeId: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'NULL',
    nullable: true
  })
  check_in: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'NULL',
    nullable: true
  })
  check_out: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'NULL',
    nullable: true
  })
  apel_in: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'NULL',
    nullable: true
  })
  apel_out: string;

  @Column({ type: 'varchar', length: 50, nullable: true, default: '' })
  latitude_in: string;

  @Column({ type: 'varchar', length: 50, nullable: true, default: '' })
  longtitude_in: string;

  @Column({ type: 'varchar', length: 50, nullable: true, default: '' })
  latitude_out: string;

  @Column({ type: 'varchar', length: 50, nullable: true, default: '' })
  longtitude_out: string;

  @Column({
    type: 'smallint',
    width: 3,
    default: 0,
    comment: '1->clockin, 3->clock in apel, 4->clock out apel, 2->clockout',
    nullable: true
  })
  status: number;

  @Column({
    type: 'smallint',
    width: 2,
    default: 0,
    comment: '0->active, 1->inactive',
    nullable: true
  })
  is_deleted: number;

  @ManyToOne(() => User, user => user.id)
  createdBy: User;
  @Column({ default: null, nullable: true })
  createdById: number;

  @ManyToOne(() => User, user => user.id)
  updatedBy: User;
  @Column({ default: null, nullable: true })
  updatedById: number;

  @ManyToOne(() => User, user => user.id)
  deletedBy: User;
  @Column({ default: null, nullable: true })
  deletedById: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'NULL',
    nullable: true
  })
  deleted_at: string;

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
