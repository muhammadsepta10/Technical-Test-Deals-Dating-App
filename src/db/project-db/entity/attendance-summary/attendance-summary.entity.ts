import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from '../user/user.entity';
import { AttendanceStatusDet } from '../attendance-status-det/attendance-status-det.entity';
import { UserEmployee } from '../user-employee/user-employee.entity';

@Entity('attendance_summary')
export class AttendanceSummary {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => AttendanceStatusDet, attendanceStatusDet => attendanceStatusDet.id)
  attendanceStatusDet: AttendanceStatusDet;
  @Column({ default: null, nullable: true })
  attendanceStatusDetId: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uniqueId: string;

  @ManyToOne(() => UserEmployee, userEmployee => userEmployee.id)
  employee: UserEmployee;
  @Column({ type: 'int4', nullable: true, default: null })
  employeeId: number;

  @Column({ type: 'int4', nullable: false })
  year: number;

  @Column({ type: 'int4', nullable: false })
  month: number;

  @Column({ type: 'int4', default: 0 })
  total_count: number;

  @Column({
    type: 'smallint',
    width: 3,
    default: 0,
    comment: '0->inactive, 1->active',
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
