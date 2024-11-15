import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  Index
} from 'typeorm';
import { MasterAccess } from '../master-access/master-access.entity';
import { LoginSession } from '../login-session/login-session.entity';
import { MasterMenu } from '../master-menu/master-menu.entity';
import { User } from '../user/user.entity';

@Entity('master_media')
export class MasterMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'int', width: 11, default: 0 })
  code: number;

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

  @OneToMany(() => MasterAccess, access => access.masterMedia)
  access: MasterAccess[];

  @OneToMany(() => MasterMenu, menu => menu.masterMedia)
  menus: MasterMenu[];

  @OneToMany(() => LoginSession, loginSession => loginSession.masterMedia)
  loginSessions: LoginSession[];

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
