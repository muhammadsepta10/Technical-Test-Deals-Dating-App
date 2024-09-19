import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('overtime_category')
export class OvertimeCategory {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uniqueId: string;

  @Column({ type: 'varchar', unique: true, default: null, length: 150 })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: null, nullable: true })
  rate: string;

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
