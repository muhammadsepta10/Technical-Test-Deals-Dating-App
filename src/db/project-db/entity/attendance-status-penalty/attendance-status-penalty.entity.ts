import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from '../user/user.entity';
import { AttendanceStatusDet } from '../attendance-status-det/attendance-status-det.entity';

@Entity('attendance_status_penalty')
export class AttendanceStatusPenalty {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => AttendanceStatusDet, attendanceStatusDet => attendanceStatusDet.id)
  attendanceStatusDet: AttendanceStatusDet;
  @Column({ default: null, nullable: true })
  attendanceStatusDetId: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uniqueId: string;

  @Column({ type: 'time', default: null })
  start_time: string;

  @Column({ type: 'time', default: null })
  end_time: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: null, nullable: true })
  deduction: string;

  @Column({ type: 'smallint', width: 3, default: 0, comment: '0->inactive, 1->active', nullable: true })
  status: number;

  @Column({ type: 'smallint', width: 2, default: 0, comment: '0->active, 1->inactive', nullable: true })
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

  @CreateDateColumn({ type: 'timestamp', default: () => 'NULL', nullable: true })
  deleted_at: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  created_at: string;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updated_at: string;
}
