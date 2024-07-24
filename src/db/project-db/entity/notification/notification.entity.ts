import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { MasterNotificationCategory } from '../master-notication-category/notification-category.entity';
import { User } from '../user/user.entity';

@Entity('notification')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uuid: string;

  @ManyToOne(() => MasterNotificationCategory, notificationCategory => notificationCategory.id)
  category: MasterNotificationCategory;
  @Column({ default: null, nullable: true })
  categoryId: number;

  @Column({ type: 'varchar', length: 255, default: '' })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text' })
  html: string;

  @Column({
    type: 'smallint',
    width: 3,
    default: 0,
    comment: '0:undelivered,1:delivered,2:read',
    nullable: true
  })
  status: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'NULL',
    nullable: true
  })
  read_at: string;

  @Column({
    type: 'smallint',
    width: 2,
    default: 0,
    comment: '0->inactive, 1->active',
    nullable: true
  })
  is_deleted: number;

  @ManyToOne(() => User, user => user.id)
  user: User;
  @Column({ default: null, nullable: true })
  userId: number;

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
