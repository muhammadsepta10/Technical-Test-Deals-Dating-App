import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  Unique
} from 'typeorm';
import { User } from '../user/user.entity';
import { MasterAccess } from '../master-access/master-access.entity';
import { MasterApp } from '../master-app/master-app.entity';

@Entity('user_access')
// for handle one app per user just only have one access
@Unique('appAccess', ['userId', 'masterAppId', 'masterAccessId'])
export class UserAccess {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uuid: string;

  @Column({ type: 'smallint', width: 3, default: 0, comment: '0:unused,1:used', nullable: true })
  status: number;

  @Column({ type: 'smallint', width: 2, default: 0, comment: '0->inactive, 1->active', nullable: true })
  is_deleted: number;

  @ManyToOne(() => MasterAccess, access => access.id)
  masterAccess: MasterAccess;
  @Column({ default: null, nullable: true })
  masterAccessId: number;

  @ManyToOne(() => MasterApp, masterApp => masterApp.id)
  masterApp: MasterApp;
  @Column({ default: null, nullable: true })
  masterAppId: number;

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

  @CreateDateColumn({ type: 'timestamp', default: () => 'NULL', nullable: true })
  deleted_at: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'NULL', nullable: true })
  read_at: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  created_at: string;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updated_at: string;
}
