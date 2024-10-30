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
import { User } from '../user/user.entity';
import { MasterCabang } from '../master-cabang/master-cabang.entity';

@Entity('shift')
@Unique('shiftUnique', ['cabangId', 'date', 'shift_type'])
export class Shift {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uuid: string;

  @ManyToOne(() => MasterCabang, masterCabang => masterCabang.id)
  cabang: MasterCabang;
  @Column({ default: null, nullable: true })
  cabangId: number;

  @Column({ type: 'int', default: 1, comment: '1,2,3', nullable: true })
  shift_type: number;

  @Column({
    type: 'int',
    default: 0,
    comment: '0->tidak wajib apel, 1->wajib apel',
    nullable: true
  })
  is_apel: number;

  @Column({ type: 'date', default: null, nullable: true })
  date: string;

  @Column({ type: 'time', default: null, nullable: true })
  start_time: string;

  @Column({ type: 'time', default: null, nullable: true })
  end_time: string;

  @Column({ type: 'time', default: null, nullable: true })
  start_time_apel: string;

  @Column({ type: 'time', default: null, nullable: true })
  end_time_apel: string;

  @Column({ type: 'int', default: 1, nullable: true })
  status: number;

  @Column({ type: 'int', default: 1, nullable: true })
  sort: string;

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
