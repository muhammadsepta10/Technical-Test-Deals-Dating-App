import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from '../user/user.entity';
import { UserJournalist } from '../user-journalist/user-journalist.entity';

@Entity('journalist_verification_code')
export class JournalistVerificationCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uuid: string;

  @Index()
  @Column({ type: 'varchar', length: 255, default: '', nullable: false, unique: true })
  verification_code: string;

  @ManyToOne(() => UserJournalist, userJournalist => userJournalist.id)
  userJournalist: UserJournalist;
  @Column({ default: null, nullable: true })
  userJournalistId: number;

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

  @Column({ type: 'smallint', width: 3, default: 0, comment: '0->unused, 1->used', nullable: true })
  status: number;

  @Column({ type: 'smallint', width: 2, default: 0, comment: '0->active, 1->inactive', nullable: true })
  is_deleted: number;

  @Column({ type: 'timestamp', default: null, nullable: true })
  used_at: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'NULL', nullable: true })
  deleted_at: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  created_at: string;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updated_at: string;
}
