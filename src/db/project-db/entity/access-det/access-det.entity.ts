import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { MasterAccess } from '../master-access/master-access.entity';
import { MasterMenu } from '../master-menu/master-menu.entity';
import { User } from '../user/user.entity';
import { MasterApp } from '../master-app/master-app.entity';

@Entity('access_det')
export class AccessDet {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uuid: string;

  @Column({ type: 'smallint', width: 2, default: 0, nullable: true })
  m_insert: number;

  @Column({ type: 'smallint', width: 2, default: 0, nullable: true })
  m_update: number;

  @Column({ type: 'smallint', width: 2, default: 0, nullable: true })
  m_delete: number;

  @Column({ type: 'smallint', width: 2, default: 0, nullable: true })
  m_view: number;

  @Column({ type: 'smallint', width: 2, default: 0, nullable: true })
  m_export: number;

  @Column({ type: 'smallint', width: 2, default: 0, nullable: true })
  m_import: number;

  @Column({ type: 'smallint', width: 2, default: 0, nullable: true })
  m_approve: number;

  @Column({ type: 'smallint', width: 2, default: 0, nullable: true })
  m_nego: number;

  @Column({ type: 'smallint', width: 2, default: 0, nullable: true })
  is_user: number;

  @Column({ type: 'smallint', width: 2, default: 0, comment: '0->false, 1->true' })
  is_deleted: number;

  @ManyToOne(() => MasterAccess, access => access.id)
  access: MasterAccess;
  @Column({ type: 'int', default: null })
  accessId: number;

  @ManyToOne(() => MasterApp, masterApp => masterApp.id)
  masterApp: MasterApp;
  @Column({ type: 'int', default: null })
  masterAppId: number;

  @ManyToOne(() => MasterMenu, menu => menu.id)
  menu: MasterMenu;
  @Column({ type: 'int', default: null })
  menuId: number;

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
