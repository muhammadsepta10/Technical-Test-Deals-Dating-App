import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { NewsVerification } from '../news-verification/news-verification.entity';
import { MasterInvalidReason } from '../master-invalid-reason/master-invalid-reason.entity';

@Entity({ name: 'news_verification_history' })
export class NewsVerificationHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => NewsVerification, newsVerification => newsVerification.id)
  newsVerification: NewsVerification;
  @Column({ default: null, nullable: true })
  newsVerificationId: number;

  @ManyToOne(() => User, user => user.id)
  verifiedBy: User;
  @Column({ default: null, nullable: true })
  verifiedById: number;

  @ManyToOne(() => User, user => user.id)
  approvedBy: User;
  @Column({ default: null, nullable: true })
  approvedById: number;

  @ManyToOne(() => MasterInvalidReason, invalidReason => invalidReason.id)
  masterInvalidReason: MasterInvalidReason;
  @Column({ default: null, nullable: true })
  masterInvalidReasonId: number;

  @Column({ type: 'int', default: 0 })
  status: number;

  @Column({
    type: 'smallint',
    width: 2,
    default: 0,
    comment: '0->active, 1->inactive',
    nullable: true
  })
  is_deleted: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'NULL',
    nullable: true
  })
  deleted_at: string;

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

  @Column({ type: 'timestamp', default: null, nullable: true })
  verified_at: string;

  @Column({ type: 'timestamp', default: null, nullable: true })
  approved_at: string;
}
