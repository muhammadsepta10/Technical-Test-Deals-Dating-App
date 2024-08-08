import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from '../user/user.entity';
import { MasterInstanceCategory } from '../master-instance-category/master-instance-category.entity';
import { MasterWorkUnit } from '../master-work-unit/master-work-unit.entity';
import { MasterInvalidReason } from '../master-invalid-reason/master-invalid-reason.entity';

@Entity('guest_book')
export class GuestBook {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 255, default: '', nullable: true, comment: 'nama tamu' })
  guest_name: string;

  @Column({ type: 'varchar', length: 255, default: '', nullable: true, comment: 'email tamu' })
  guest_email: string;

  @Column({ type: 'varchar', length: 255, default: '', nullable: true, comment: 'nama instansi' })
  instance_name: string;

  @Column({ type: 'varchar', length: 255, default: '', nullable: true, comment: 'wa no tamu' })
  wa_no: string;

  @Column({ type: 'varchar', length: 255, default: '', nullable: true, comment: 'Pic' })
  pic: string;

  @Column({ type: 'varchar', length: 255, default: '', nullable: true, comment: 'tujuan bertamu' })
  purpose: string;

  @Column({ type: 'int', default: 0, comment: '0->process, 1=> approve, 2=>reject' })
  status: number;

  @ManyToOne(() => MasterInvalidReason, masterReason => masterReason.id)
  masterReason: MasterInvalidReason;
  @Column({ type: 'int', default: null, nullable: true })
  masterReasonId: number;

  @ManyToOne(() => MasterInstanceCategory, masterInstanceCategory => masterInstanceCategory.id)
  masterInstanceCategory: MasterInstanceCategory;
  @Column({ type: 'int', default: null, nullable: true })
  masterInstanceCategoryId: number;

  @ManyToOne(() => MasterWorkUnit, masterWorkUnit => masterWorkUnit.id)
  masterWorkUnit: MasterWorkUnit;
  @Column({ type: 'int', default: null, nullable: true })
  masterWorkUnitId: number;

  @ManyToOne(() => User, user => user.id)
  createdBy: User;
  @Column({ default: null, nullable: true })
  createdById: number;

  @ManyToOne(() => User, user => user.id)
  approvedBy: User;
  @Column({ default: null, nullable: true })
  approvedById: number;

  @ManyToOne(() => User, user => user.id)
  updatedBy: User;
  @Column({ default: null, nullable: true })
  updatedById: number;

  @ManyToOne(() => User, user => user.id)
  deletedBy: User;
  @Column({ default: null, nullable: true })
  deletedById: number;

  @Column({ type: 'timestamp', default: null, nullable: true })
  start_time: string;

  @Column({ type: 'timestamp', default: null, nullable: true })
  end_time: string;

  @Column({ type: 'timestamp', default: null, nullable: true })
  approved_at: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'NULL', nullable: true })
  deleted_at: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', nullable: true })
  created_at: string;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
    nullable: true
  })
  updated_at: string;
}
