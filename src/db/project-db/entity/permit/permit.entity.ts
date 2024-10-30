import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from '../user/user.entity';
import { AttendanceStatusDet } from '../attendance-status-det/attendance-status-det.entity';
import { UserEmployee } from '../user-employee/user-employee.entity';
import { MasterPermitType } from '../master-permit-type/master-permit-type.entity';
import { MasterPermissionCategory } from '../master-permission-category/master-permission-category.entity';

@Entity('permit')
export class Permit {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uuid: string;

  @ManyToOne(() => AttendanceStatusDet, attendanceStatusDet => attendanceStatusDet.id)
  attendanceStatusDet: AttendanceStatusDet;
  @Column({ default: null, nullable: true })
  attendanceStatusDetId: number;

  @ManyToOne(() => MasterPermissionCategory, masterPermissionCategory => masterPermissionCategory.id)
  masterPermissionCategory: MasterPermissionCategory;
  @Column({ default: null, nullable: true })
  masterPermissionCategoryId: number;

  @ManyToOne(() => UserEmployee, userEmployee => userEmployee.id)
  userEmployee: UserEmployee;
  @Column({ default: null, nullable: true })
  userEmployeeId: number;

  @ManyToOne(() => MasterPermitType, masterPermitType => masterPermitType.id)
  masterPermitType: MasterPermitType;
  @Column({ default: null, nullable: true })
  masterPermitTypeId: number;

  @Column({
    type: 'smallint',
    width: 3,
    default: 0,
    comment: '0->process,1->approve,2->reject',
    nullable: true
  })
  status: number;

  @Column({
    type: 'smallint',
    width: 3,
    default: 0,
    comment: '1->izin,2->cuti',
    nullable: true
  })
  type: number;

  @Column({
    type: 'int',
    default: 0,
    nullable: true
  })
  days: number;

  @Column({ type: 'text', default: '', nullable: true })
  description: string;

  @Column({
    type: 'smallint',
    width: 2,
    default: 0,
    comment: '0->active, 1->inactive',
    nullable: true
  })
  is_deleted: number;

  @ManyToOne(() => User, user => user.id)
  approvedBy: User;
  @Column({ default: null, nullable: true })
  approvedById: number;

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

  @Column({ type: 'timestamp', default: null, nullable: true })
  start_date: string;

  @Column({ type: 'timestamp', default: null, nullable: true })
  end_date: string;

  @Column({ type: 'timestamp', default: null, nullable: true })
  approved_at;

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
