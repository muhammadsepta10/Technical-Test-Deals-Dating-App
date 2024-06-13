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
import { AccessDet } from '../access-det/access-det.entity';
import { User } from '../user/user.entity';
import { MasterMedia } from '../master-media/master-media.entity';

@Entity('master_menu')
export class MasterMenu {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()', unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  description: string;

  @Column({ type: 'int', width: 11, default: 0, nullable: true })
  level: number;

  @Column({ type: 'int', width: 4, nullable: true })
  header: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  path: string;

  @Column({
    type: 'smallint',
    width: 3,
    default: 0,
    comment: '0->inactive, 1->active',
    nullable: true
  })
  status: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon: string;

  @Column({ type: 'int', width: 3, default: 0, nullable: true })
  sort: number;

  @Column({ type: 'int', width: 2, default: 0, nullable: true })
  isDisabled: number;

  @Column({
    type: 'smallint',
    width: 2,
    default: 0,
    comment: '0->active, 1->inactive',
    nullable: true
  })
  is_deleted: number;

  @OneToMany(() => AccessDet, accessDet => accessDet.menu)
  accessDet: AccessDet[];

  @ManyToOne(() => MasterMedia, media => media.id)
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
    default: () => 'CURRENT_TIMESTAMP(6)',
    nullable: true
  })
  created_at: string;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
    nullable: true
  })
  updated_at: string;
}
