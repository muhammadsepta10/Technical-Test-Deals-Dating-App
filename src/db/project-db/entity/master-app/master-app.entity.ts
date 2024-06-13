import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  OneToMany
} from 'typeorm';
import { User } from '../user/user.entity';
import { MasterMedia } from '../master-media/master-media.entity';
import { UserAccess } from '../user-access/user-access.entity';

@Entity('master_app')
export class MasterApp {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  name: string;

  @Column({ type: 'varchar', length: 255, default: null, nullable: true, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  secret_key: string;

  @Column({
    type: 'smallint',
    width: 3,
    default: 0,
    comment: '0->inactive, 1->active',
    nullable: true
  })
  status: number;

  @Column({ type: 'smallint', width: 3, default: 0, nullable: true })
  sort: number;

  @Column({
    type: 'smallint',
    width: 2,
    default: 0,
    comment: '0->active, 1->inactive',
    nullable: true
  })
  is_deleted: number;

  @OneToMany(() => UserAccess, userAccess => userAccess.masterApp)
  usersAcess: UserAccess[];

  @ManyToOne(() => MasterMedia, masterMedia => masterMedia.id)
  masterMedia: MasterMedia;
  @Column({ default: null, nullable: true })
  masterMediaId: number;

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
