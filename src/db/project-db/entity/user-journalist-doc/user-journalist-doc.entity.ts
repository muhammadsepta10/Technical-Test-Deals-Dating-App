import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { UserJournalist } from '../user-journalist/user-journalist.entity';

@Entity()
export class UserJournalistDoc {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserJournalist, user_journalist => user_journalist.id)
  userJournalist: UserJournalist;
  @Column({ default: null, nullable: true })
  userJournalistId: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'varchar', length: 255, default: null, nullable: true })
  path: string;

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
}
